import os
import shutil
from datetime import datetime

def create_student_info_folder(roll_id, name, email, photo_path):
    """Create student info folder with all details"""
    try:
        project_root = os.path.dirname(__file__)
        student_info_dir = os.path.join(project_root, '..', 'database', 'student_info', roll_id)
        os.makedirs(student_info_dir, exist_ok=True)
        
        # Copy enrollment photo
        photo_dest = os.path.join(student_info_dir, f"{roll_id}_enrollment.jpg")
        shutil.copy2(photo_path, photo_dest)
        
        # Create email text file with student name as filename
        email_file = os.path.join(student_info_dir, f"{name.replace(' ', '_')}.txt")
        with open(email_file, 'w') as f:
            f.write(f"Student Name: {name}\n")
            f.write(f"Roll Number: {roll_id}\n")
            f.write(f"Email: {email}\n")
            f.write(f"Enrollment Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        
        print(f"📁 Student info folder created: {roll_id}")
        
    except Exception as e:
        print(f"❌ Error creating student info folder: {e}")

def send_absence_email(student, date):
    """Send professional absence alert email"""
    try:
        project_root = os.path.dirname(__file__)
        student_folder = os.path.join(project_root, '..', 'database', student['roll_id'])
        
        if os.path.exists(student_folder):
            alert_file = os.path.join(student_folder, f"absence_alert_{date}.txt")
            
            with open(alert_file, 'w') as f:
                f.write(f"ABSENCE ALERT - {date}\n")
                f.write(f"="*40 + "\n\n")
                f.write(f"Dear {student['name']},\n\n")
                f.write(f"This is to inform you that you were marked absent on {date}.\n")
                f.write(f"Roll Number: {student['roll_id']}\n")
                f.write(f"Email: {student['email']}\n\n")
                f.write(f"Please contact the administration if this is an error.\n\n")
                f.write(f"Best regards,\n")
                f.write(f"NeuroAttend AI System\n")
                f.write(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            
            print(f"📧 Absence alert created for {student['name']} ({student['roll_id']})")
            return True
        
        return False
        
    except Exception as e:
        print(f"❌ Error sending absence email: {e}")
        return False