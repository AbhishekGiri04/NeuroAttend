import cv2
import face_recognition
import numpy as np
from database import get_student_by_roll_id, save_id_card_verification
import os

class IDVerificationService:
    def __init__(self):
        # Load Haar cascade for face detection
        cascade_path = os.path.join(os.path.dirname(__file__), 'haarcascade_frontalface_default.xml')
        self.face_cascade = cv2.CascadeClassifier(cascade_path)
    
    def verify_id_card(self, roll_number, id_card_image_path):
        """Verify ID card photo matches enrolled student photo (OPTIONAL - not required for attendance)"""
        try:
            # Get enrolled student data
            student = get_student_by_roll_id(roll_number)
            if not student:
                return {
                    'status': 'error',
                    'message': f'No student found with roll number: {roll_number}'
                }
            
            # Save ID card photo to database folder with roll number naming
            saved_photo_path = self.save_id_card_photo(roll_number, id_card_image_path)
            
            # Extract face encoding from ID card
            id_card_encoding = self.extract_face_encoding(id_card_image_path)
            if id_card_encoding is None:
                return {
                    'status': 'error',
                    'message': 'No face detected in ID card photo'
                }
            
            # Check if this ID card was already used for another student
            duplicate_verification = self.check_duplicate_id_card(id_card_encoding, student['id'])
            if duplicate_verification:
                return {
                    'status': 'error',
                    'message': f'This ID card was already used for verification by another student: {duplicate_verification["student_name"]} ({duplicate_verification["roll_number"]})'
                }
            
            # Compare with enrolled face encoding
            enrolled_encoding = student['face_encoding']
            face_distance = face_recognition.face_distance([enrolled_encoding], id_card_encoding)[0]
            
            # Verification threshold
            is_verified = face_distance < 0.5
            
            # Save verification result to database with photo path
            verification_id = save_id_card_verification(
                student['id'], 
                roll_number, 
                id_card_encoding, 
                is_verified,
                face_distance,
                saved_photo_path
            )
            
            if is_verified:
                return {
                    'status': 'verified',
                    'message': f'ID Card Verified! Face matches enrolled student {student["name"]}\n\nNote: ID verification is optional. Attendance is marked based on enrollment photo only.',
                    'student_name': student['name'],
                    'roll_number': roll_number,
                    'confidence': round((1 - face_distance) * 100, 2),
                    'photo_saved': saved_photo_path
                }
            else:
                return {
                    'status': 'not_verified',
                    'message': f'ID Card Not Verified! Face does not match enrolled student {student["name"]}\n\nNote: This does not affect attendance. Student can still be marked present via enrollment photo.',
                    'student_name': student['name'],
                    'roll_number': roll_number,
                    'confidence': round((1 - face_distance) * 100, 2),
                    'photo_saved': saved_photo_path
                }
                
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Verification failed: {str(e)}'
            }
    
    def extract_face_encoding(self, image_path):
        """Extract face encoding from image using Haar cascade"""
        try:
            # Load image
            image = cv2.imread(image_path)
            if image is None:
                return None
                
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Detect face using Haar cascade
            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(50, 50)
            )
            
            if len(faces) == 0:
                return None
                
            # Use the largest detected face
            largest_face = max(faces, key=lambda rect: rect[2] * rect[3])
            x, y, w, h = largest_face
            
            # Extract face region
            face_region = image[y:y+h, x:x+w]
            rgb_face = cv2.cvtColor(face_region, cv2.COLOR_BGR2RGB)
            
            # Get face encoding
            face_encodings = face_recognition.face_encodings(rgb_face)
            
            if len(face_encodings) > 0:
                return face_encodings[0]
            else:
                return None
                
        except Exception as e:
            print(f"Error extracting face encoding: {e}")
            return None
    
    def save_id_card_photo(self, roll_number, temp_image_path):
        """Save ID card photo to database folder with roll number naming"""
        try:
            import shutil
            
            # Create database folder if not exists (outside backend)
            project_root = os.path.dirname(os.path.dirname(__file__))
            db_folder = os.path.join(project_root, 'database', 'id_cards')
            os.makedirs(db_folder, exist_ok=True)
            
            # Generate filename with roll number only
            filename = f"{roll_number}.jpg"
            saved_path = os.path.join(db_folder, filename)
            
            # Copy file to database folder
            shutil.copy2(temp_image_path, saved_path)
            
            print(f"💾 ID card photo saved: {filename}")
            return saved_path
            
        except Exception as e:
            print(f"Error saving ID card photo: {e}")
            return None
    
    def check_duplicate_id_card(self, id_card_encoding, current_student_id, tolerance=0.4):
        """Check if ID card was already used by another student"""
        try:
            from database import get_all_id_verifications
            
            # Get all previous ID card verifications
            verifications = get_all_id_verifications()
            
            for verification in verifications:
                # Skip if same student
                if verification['student_id'] == current_student_id:
                    continue
                
                # Compare face encodings
                distance = face_recognition.face_distance([verification['id_card_encoding']], id_card_encoding)[0]
                
                if distance < tolerance:
                    return {
                        'student_name': verification['student_name'],
                        'roll_number': verification['roll_number']
                    }
            
            return None
            
        except Exception as e:
            print(f"Error checking duplicate ID card: {e}")
            return None