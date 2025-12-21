import cv2
import numpy as np
from database import get_all_students, mark_attendance
import base64
from io import BytesIO
from PIL import Image
import os

# Try to import face_recognition, fallback to OpenCV if not available
try:
    import face_recognition
    USE_FACE_RECOGNITION = True
    print("✅ Using face_recognition library")
except ImportError:
    USE_FACE_RECOGNITION = False
    print("⚠️ Using OpenCV fallback for production deployment")
    from sklearn.metrics.pairwise import cosine_similarity

class FaceRecognitionService:
    def __init__(self):
        self.known_face_encodings = []
        self.known_face_names = []
        self.known_face_ids = []
        self.known_face_rolls = []
        self.tolerance = 0.6
        
        if not USE_FACE_RECOGNITION:
            self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        self.load_known_faces()
    
    def load_known_faces(self):
        """Load enrollment photos for attendance marking"""
        students = get_all_students()
        
        self.known_face_encodings = []
        self.known_face_names = []
        self.known_face_ids = []
        self.known_face_rolls = []
        
        for student in students:
            self.known_face_encodings.append(student['face_encoding'])
            self.known_face_names.append(student['name'])
            self.known_face_ids.append(student['id'])
            self.known_face_rolls.append(student['roll_id'])
        
        print(f"🎯 Loaded {len(students)} students for attendance")
    
    def encode_face_from_image(self, image_file):
        """Extract face encoding - uses best available method"""
        try:
            if USE_FACE_RECOGNITION:
                return self._encode_with_face_recognition(image_file)
            else:
                return self._encode_with_opencv(image_file)
        except Exception as e:
            print(f"❌ Error encoding face: {e}")
            return None
    
    def _encode_with_face_recognition(self, image_file):
        """Use face_recognition library (local)"""
        image = face_recognition.load_image_file(image_file)
        face_locations = face_recognition.face_locations(image)
        
        if len(face_locations) == 0:
            return None
        
        face_encodings = face_recognition.face_encodings(image, face_locations)
        return face_encodings[0] if len(face_encodings) > 0 else None
    
    def _encode_with_opencv(self, image_file):
        """Use OpenCV fallback (deployment)"""
        image = cv2.imread(image_file)
        if image is None:
            return None
        
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.1, 4)
        
        if len(faces) == 0:
            return None
        
        # Use largest face
        largest_face = max(faces, key=lambda x: x[2] * x[3])
        x, y, w, h = largest_face
        face_region = image[y:y+h, x:x+w]
        
        return self._create_opencv_encoding(face_region)
    
    def _create_opencv_encoding(self, face_region):
        """Create encoding using OpenCV features"""
        try:
            face_resized = cv2.resize(face_region, (128, 128))
            gray_face = cv2.cvtColor(face_resized, cv2.COLOR_BGR2GRAY)
            
            hist = cv2.calcHist([gray_face], [0], None, [64], [0, 256])
            grad_x = cv2.Sobel(gray_face, cv2.CV_64F, 1, 0, ksize=3)
            grad_y = cv2.Sobel(gray_face, cv2.CV_64F, 0, 1, ksize=3)
            
            features = np.concatenate([
                hist.flatten(),
                [np.mean(grad_x)],
                [np.mean(grad_y)]
            ])
            
            return features / (np.linalg.norm(features) + 1e-7)
        except:
            return np.random.rand(66)
    
    def process_frame(self, frame_data):
        """Process video frame - uses best available method"""
        try:
            if USE_FACE_RECOGNITION:
                return self._process_with_face_recognition(frame_data)
            else:
                return self._process_with_opencv(frame_data)
        except Exception as e:
            print(f"❌ Error processing frame: {e}")
            return []
    
    def _process_with_face_recognition(self, frame_data):
        """Process using face_recognition library"""
        image_data = base64.b64decode(frame_data.split(',')[1])
        image = Image.open(BytesIO(image_data))
        frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        face_locations = face_recognition.face_locations(rgb_frame)
        if len(face_locations) == 0:
            return []
        
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
        results = []
        
        for i, face_encoding in enumerate(face_encodings):
            face_location = face_locations[i]
            
            # Check for mask detection using face region analysis
            top, right, bottom, left = face_location
            face_region = rgb_frame[top:bottom, left:right]
            
            # Simple mask detection based on face coverage
            face_height = bottom - top
            lower_face = face_region[int(face_height * 0.6):, :]
            
            # Check if lower face is obscured (mask detection)
            lower_face_gray = cv2.cvtColor(lower_face, cv2.COLOR_RGB2GRAY)
            mask_detected = np.mean(lower_face_gray) < 80  # Dark region indicates mask
            
            if len(self.known_face_encodings) > 0:
                face_distances = face_recognition.face_distance(self.known_face_encodings, face_encoding)
                best_match_index = np.argmin(face_distances)
                min_distance = face_distances[best_match_index]
                
                if min_distance < self.tolerance:
                    name = self.known_face_names[best_match_index]
                    student_id = self.known_face_ids[best_match_index]
                    roll_number = self.known_face_rolls[best_match_index]
                    
                    attendance_marked = mark_attendance(student_id)
                    confidence = round((1 - min_distance) * 100, 1)
                    
                    # Determine status based on mask detection
                    if mask_detected:
                        status = 'Recognized with Mask'
                        result_type = 'masked'
                    else:
                        status = 'Recognized & Present'
                        result_type = 'present'
                    
                    results.append({
                        'name': name,
                        'roll_number': roll_number,
                        'status': status,
                        'timestamp': self.get_current_time(),
                        'type': result_type,
                        'confidence': confidence,
                        'attendance_marked': attendance_marked,
                        'student_id': student_id
                    })
                else:
                    # Unknown person detected
                    confidence = round((1 - min_distance) * 100, 1) if min_distance < 1.0 else 0
                    
                    if mask_detected:
                        status = 'Unknown Person with Mask'
                        result_type = 'unknown_masked'
                    else:
                        status = 'Unknown Person Detected'
                        result_type = 'unknown'
                    
                    results.append({
                        'name': 'Unknown Person',
                        'roll_number': None,
                        'status': status,
                        'timestamp': self.get_current_time(),
                        'type': result_type,
                        'confidence': confidence,
                        'attendance_marked': False,
                        'student_id': None
                    })
            else:
                # No enrolled students - all are unknown
                results.append({
                    'name': 'Unknown Person',
                    'roll_number': None,
                    'status': 'Unknown Person - No Students Enrolled',
                    'timestamp': self.get_current_time(),
                    'type': 'unknown',
                    'confidence': 0,
                    'attendance_marked': False,
                    'student_id': None
                })
        
        return results
    
    def _process_with_opencv(self, frame_data):
        """Process using OpenCV fallback"""
        image_data = base64.b64decode(frame_data.split(',')[1])
        image = Image.open(BytesIO(image_data))
        frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.1, 4)
        
        results = []
        for (x, y, w, h) in faces:
            face_region = frame[y:y+h, x:x+w]
            
            # Mask detection for OpenCV
            face_gray = cv2.cvtColor(face_region, cv2.COLOR_BGR2GRAY)
            lower_face = face_gray[int(h * 0.6):, :]
            mask_detected = np.mean(lower_face) < 80 if len(lower_face) > 0 else False
            
            face_encoding = self._create_opencv_encoding(face_region)
            
            if len(self.known_face_encodings) > 0:
                distances = []
                for known_encoding in self.known_face_encodings:
                    try:
                        similarity = cosine_similarity([known_encoding], [face_encoding])[0][0]
                        distances.append(1 - similarity)
                    except:
                        distances.append(1.0)
                
                distances = np.array(distances)
                best_match_index = np.argmin(distances)
                min_distance = distances[best_match_index]
                
                if min_distance < self.tolerance:
                    name = self.known_face_names[best_match_index]
                    student_id = self.known_face_ids[best_match_index]
                    roll_number = self.known_face_rolls[best_match_index]
                    
                    attendance_marked = mark_attendance(student_id)
                    confidence = round((1 - min_distance) * 100, 1)
                    
                    # Determine status based on mask detection
                    if mask_detected:
                        status = 'Recognized with Mask'
                        result_type = 'masked'
                    else:
                        status = 'Recognized & Present'
                        result_type = 'present'
                    
                    results.append({
                        'name': name,
                        'roll_number': roll_number,
                        'status': status,
                        'timestamp': self.get_current_time(),
                        'type': result_type,
                        'confidence': confidence,
                        'attendance_marked': attendance_marked,
                        'student_id': student_id
                    })
                else:
                    # Unknown person detected
                    confidence = round((1 - min_distance) * 100, 1) if min_distance < 1.0 else 0
                    
                    if mask_detected:
                        status = 'Unknown Person with Mask'
                        result_type = 'unknown_masked'
                    else:
                        status = 'Unknown Person Detected'
                        result_type = 'unknown'
                    
                    results.append({
                        'name': 'Unknown Person',
                        'roll_number': None,
                        'status': status,
                        'timestamp': self.get_current_time(),
                        'type': result_type,
                        'confidence': confidence,
                        'attendance_marked': False,
                        'student_id': None
                    })
            else:
                # No enrolled students
                results.append({
                    'name': 'Unknown Person',
                    'roll_number': None,
                    'status': 'Unknown Person - No Students Enrolled',
                    'timestamp': self.get_current_time(),
                    'type': 'unknown',
                    'confidence': 0,
                    'attendance_marked': False,
                    'student_id': None
                })
        
        return results
    
    def check_duplicate_face(self, new_face_encoding, tolerance=0.5):
        """Check if face encoding already exists"""
        try:
            if len(self.known_face_encodings) == 0:
                return None
            
            if USE_FACE_RECOGNITION:
                face_distances = face_recognition.face_distance(self.known_face_encodings, new_face_encoding)
            else:
                distances = []
                for known_encoding in self.known_face_encodings:
                    try:
                        similarity = cosine_similarity([known_encoding], [new_face_encoding])[0][0]
                        distances.append(1 - similarity)
                    except:
                        distances.append(1.0)
                face_distances = np.array(distances)
            
            matches = face_distances < tolerance
            
            if any(matches):
                match_index = np.argmin(face_distances)
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