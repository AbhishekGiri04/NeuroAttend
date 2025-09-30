import cv2
import face_recognition
import numpy as np
from database import get_all_students, mark_attendance
import base64
from io import BytesIO
from PIL import Image
import os

class FaceRecognitionService:
    def __init__(self):
        self.known_face_encodings = []
        self.known_face_names = []
        self.known_face_ids = []
        self.known_face_rolls = []
        # Load Haar cascade for face detection
        cascade_path = os.path.join(os.path.dirname(__file__), 'haarcascade_frontalface_default.xml')
        self.face_cascade = cv2.CascadeClassifier(cascade_path)
        # Enhanced model for facial structure recognition
        self.face_model = 'large'  # Use large model for better accuracy
        self.tolerance = 0.6  # Balanced tolerance for age-invariant recognition
        self.structure_weight = 0.7  # Weight for facial structure features
        self.load_known_faces()
    
    def load_known_faces(self):
        """Load only enrollment photos for attendance marking (ID verification is optional)"""
        students = get_all_students()
        
        self.known_face_encodings = []
        self.known_face_names = []
        self.known_face_ids = []
        self.known_face_rolls = []
        
        for student in students:
            # Only use enrollment face encoding for attendance
            self.known_face_encodings.append(student['face_encoding'])
            self.known_face_names.append(student['name'])
            self.known_face_ids.append(student['id'])
            self.known_face_rolls.append(student['roll_id'])
        
        print(f"🎯 Loaded {len(students)} students for attendance (enrollment photos only)")
    
    def process_frame(self, frame_data):
        """Process video frame for face recognition using best model"""
        try:
            # Decode base64 image
            image_data = base64.b64decode(frame_data.split(',')[1])
            image = Image.open(BytesIO(image_data))
            frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            
            # Resize frame for better processing
            height, width = frame.shape[:2]
            if width > 800:
                scale = 800 / width
                new_width = int(width * scale)
                new_height = int(height * scale)
                frame = cv2.resize(frame, (new_width, new_height))
            
            # Enhance image quality
            frame = cv2.convertScaleAbs(frame, alpha=1.2, beta=10)
            
            # Convert to RGB for face_recognition
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Find faces using face_recognition (better than Haar cascade)
            face_locations = face_recognition.face_locations(rgb_frame, model='hog', number_of_times_to_upsample=1)
            
            print(f"🔍 Found {len(face_locations)} faces in frame")
            
            if len(face_locations) == 0:
                print("❌ No faces detected in frame")
                return []
            
            print(f"📸 Frame size: {frame.shape}, Face locations: {face_locations}")
            
            # Get face encodings using large model for better accuracy
            face_encodings = face_recognition.face_encodings(
                rgb_frame, 
                face_locations, 
                model=self.face_model,
                num_jitters=1  # Reduce jitters for faster processing
            )
            
            print(f"🧠 Generated {len(face_encodings)} face encodings")
            print(f"📚 Comparing with {len(self.known_face_encodings)} known faces")
            
            results = []
            
            for face_encoding in face_encodings:
                # Enhanced comparison using facial structure
                face_distances = self.enhanced_face_distance(self.known_face_encodings, face_encoding)
                
                if len(face_distances) > 0:
                    best_match_index = np.argmin(face_distances)
                    min_distance = face_distances[best_match_index]
                    
                    print(f"🎯 Best match distance: {min_distance:.3f}, tolerance: {self.tolerance}")
                    print(f"📚 Available students: {[name for name in self.known_face_names]}")
                    
                    # Use enrollment photo only for attendance marking
                    if min_distance < self.tolerance:
                        # Face recognized from enrollment photo
                        name = self.known_face_names[best_match_index]
                        student_id = self.known_face_ids[best_match_index]
                        roll_number = self.known_face_rolls[best_match_index]
                        
                        # Mark attendance based on enrollment photo match
                        attendance_marked = mark_attendance(student_id)
                        
                        confidence = round((1 - min_distance) * 100, 1)
                        
                        results.append({
                            'name': name,
                            'roll_number': roll_number,
                            'status': 'Recognized & Present',
                            'timestamp': self.get_current_time(),
                            'type': 'present',
                            'confidence': confidence,
                            'attendance_marked': attendance_marked,
                            'student_id': student_id,
                            'source': 'enrollment_photo'
                        })
                        
                        print(f"✅ {name} ({roll_number}) marked present via enrollment photo ({confidence}%)")
                        return results
                    else:
                        print(f"❌ Face not recognized - distance {min_distance:.3f} > tolerance {self.tolerance}")
                        print(f"🔍 Try moving closer to camera or improving lighting")
                else:
                    print("❌ No known faces to compare with - check if students are enrolled")
            
            return results
            
        except Exception as e:
            print(f"❌ Error processing frame: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    def is_attendance_eligible(self, student_id):
        """Check if student is eligible for attendance marking (enrollment photo sufficient)"""
        # Attendance is based on enrollment photo only
        # ID verification is optional and doesn't affect attendance eligibility
        return True
    
    def check_duplicate_face(self, new_face_encoding, tolerance=0.5):
        """Check if face encoding already exists using enhanced comparison"""
        try:
            if len(self.known_face_encodings) == 0:
                return None
            
            face_distances = self.enhanced_face_distance(self.known_face_encodings, new_face_encoding)
            
            matches = face_distances < tolerance
            
            if any(matches):
                match_index = matches.argmax()
                return {
                    'name': self.known_face_names[match_index],
                    'roll_id': self.known_face_rolls[match_index],
                    'student_id': self.known_face_ids[match_index]
                }
            
            return None
            
        except Exception as e:
            print(f"Error checking duplicate face: {e}")
            return None
    
    def get_current_time(self):
        from datetime import datetime
        return datetime.now().strftime("%I:%M:%S %p")
    
    def encode_face_from_image(self, image_file):
        """Extract enhanced face encoding focusing on facial structure and eye patterns"""
        try:
            # Load and preprocess image
            image = face_recognition.load_image_file(image_file)
            
            # Enhance image quality for better feature extraction
            image_cv = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
            image_cv = cv2.convertScaleAbs(image_cv, alpha=1.1, beta=5)
            image = cv2.cvtColor(image_cv, cv2.COLOR_BGR2RGB)
            
            # Find face locations using HOG model
            face_locations = face_recognition.face_locations(image, model='hog', number_of_times_to_upsample=2)
            
            if len(face_locations) == 0:
                print("❌ No face detected in enrollment image")
                return None
            
            # Use the first detected face
            face_location = face_locations[0]
            
            # Extract facial landmarks for structure analysis
            face_landmarks = face_recognition.face_landmarks(image, [face_location])
            
            # Get enhanced face encoding with more jitters for age-invariant features
            face_encodings = face_recognition.face_encodings(
                image, 
                [face_location], 
                model=self.face_model,
                num_jitters=5  # More jitters for better age-invariant encoding
            )
            
            if len(face_encodings) > 0 and len(face_landmarks) > 0:
                base_encoding = face_encodings[0]
                landmarks = face_landmarks[0]
                
                # Extract eye structure features
                eye_features = self.extract_eye_structure(landmarks)
                
                # Combine base encoding with eye structure features
                enhanced_encoding = np.concatenate([base_encoding, eye_features])
                
                print("✅ Enhanced face encoding with eye structure generated")
                return enhanced_encoding
            else:
                print("❌ Failed to generate enhanced face encoding")
                return None
                
        except Exception as e:
            print(f"❌ Error encoding face: {e}")
            return None
    
    def extract_eye_structure(self, landmarks):
        """Extract eye structure features for age-invariant recognition"""
        try:
            # Get eye landmarks
            left_eye = np.array(landmarks['left_eye'])
            right_eye = np.array(landmarks['right_eye'])
            
            # Calculate eye structure features
            left_eye_center = np.mean(left_eye, axis=0)
            right_eye_center = np.mean(right_eye, axis=0)
            
            # Eye distance (stable across age)
            eye_distance = np.linalg.norm(right_eye_center - left_eye_center)
            
            # Eye shape ratios (stable features)
            left_eye_width = np.max(left_eye[:, 0]) - np.min(left_eye[:, 0])
            left_eye_height = np.max(left_eye[:, 1]) - np.min(left_eye[:, 1])
            left_ratio = left_eye_width / left_eye_height if left_eye_height > 0 else 0
            
            right_eye_width = np.max(right_eye[:, 0]) - np.min(right_eye[:, 0])
            right_eye_height = np.max(right_eye[:, 1]) - np.min(right_eye[:, 1])
            right_ratio = right_eye_width / right_eye_height if right_eye_height > 0 else 0
            
            # Normalize features
            features = np.array([eye_distance, left_ratio, right_ratio]) / 100.0
            
            return features
            
        except Exception as e:
            print(f"Error extracting eye structure: {e}")
            return np.zeros(3)  # Return zero features if extraction fails
    
    def enhanced_face_distance(self, known_encodings, face_encoding):
        """Enhanced distance calculation using facial structure"""
        try:
            distances = []
            
            for known_encoding in known_encodings:
                if len(known_encoding) == len(face_encoding):
                    # Both have enhanced encodings with eye structure
                    base_distance = np.linalg.norm(known_encoding[:-3] - face_encoding[:-3])
                    structure_distance = np.linalg.norm(known_encoding[-3:] - face_encoding[-3:])
                    
                    # Weighted combination
                    combined_distance = (base_distance * (1 - self.structure_weight) + 
                                       structure_distance * self.structure_weight)
                    distances.append(combined_distance)
                else:
                    # Fallback to standard distance
                    min_len = min(len(known_encoding), len(face_encoding))
                    distances.append(np.linalg.norm(known_encoding[:min_len] - face_encoding[:min_len]))
            
            return np.array(distances)
            
        except Exception as e:
            print(f"Error in enhanced distance calculation: {e}")
            return face_recognition.face_distance(known_encodings, face_encoding)