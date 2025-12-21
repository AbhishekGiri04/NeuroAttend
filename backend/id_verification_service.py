import cv2
import face_recognition
import numpy as np
from database import get_student_by_roll_id, save_id_card_verification
import os

class IDVerificationService:
    def __init__(self):
        pass
    
    def verify_id_card(self, roll_number, id_card_image_path):
        """Verify ID card photo matches enrolled student photo"""
        try:
            student = get_student_by_roll_id(roll_number)
            if not student:
                return {
                    'status': 'error',
                    'message': f'No student found with roll number: {roll_number}'
                }
            
            # Extract face encoding from ID card
            id_card_encoding = self.extract_face_encoding(id_card_image_path)
            if id_card_encoding is None:
                return {
                    'status': 'error',
                    'message': 'No face detected in ID card photo'
                }
            
            # Compare with enrolled face encoding
            enrolled_encoding = student['face_encoding']
            face_distance = face_recognition.face_distance([enrolled_encoding], id_card_encoding)[0]
            
            is_verified = face_distance < 0.5
            
            if is_verified:
                return {
                    'status': 'verified',
                    'message': f'ID Card Verified! Face matches enrolled student {student["name"]}',
                    'student_name': student['name'],
                    'roll_number': roll_number,
                    'confidence': round((1 - face_distance) * 100, 2)
                }
            else:
                return {
                    'status': 'not_verified',
                    'message': f'ID Card Not Verified! Face does not match enrolled student {student["name"]}',
                    'student_name': student['name'],
                    'roll_number': roll_number,
                    'confidence': round((1 - face_distance) * 100, 2)
                }
                
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Verification failed: {str(e)}'
            }
    
    def extract_face_encoding(self, image_path):
        """Extract face encoding from image"""
        try:
            image = face_recognition.load_image_file(image_path)
            face_locations = face_recognition.face_locations(image)
            
            if len(face_locations) == 0:
                return None
            
            face_encodings = face_recognition.face_encodings(image, face_locations)
            
            if len(face_encodings) > 0:
                return face_encodings[0]
            else:
                return None
                
        except Exception as e:
            print(f"Error extracting face encoding: {e}")
            return None