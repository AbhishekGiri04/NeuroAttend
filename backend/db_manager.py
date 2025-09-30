import os
from datetime import datetime
from pathlib import Path

class StudentDB:
    def __init__(self):
        self.db_path = Path("../database")
    
    def create_student(self, roll_no, name, email, phone="", dept="", section=""):
        folder = self.db_path / str(roll_no)
        folder.mkdir(exist_ok=True)
        
        info_file = folder / f"{name.replace(' ', '_')}.txt"
        with open(info_file, 'w') as f:
            f.write(f"Student Name: {name}\n")
            f.write(f"Roll Number: {roll_no}\n")
            f.write(f"Email: {email}\n")
            f.write(f"Phone: {phone}\n")
            f.write(f"Department: {dept}\n")
            f.write(f"Section: {section}\n")
            f.write(f"Enrollment Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Status: Active\n")
    
    def save_photo(self, roll_no, photo_data):
        folder = self.db_path / str(roll_no)
        folder.mkdir(exist_ok=True)
        photo_path = folder / f"{roll_no}.jpg"
        with open(photo_path, 'wb') as f:
            f.write(photo_data)
    
    def save_idcard(self, roll_no, idcard_data):
        folder = self.db_path / str(roll_no)
        folder.mkdir(exist_ok=True)
        idcard_path = folder / "idcard.jpg"
        with open(idcard_path, 'wb') as f:
            f.write(idcard_data)
    
    def update_attendance(self, roll_no):
        folder = self.db_path / str(roll_no)
        if not folder.exists():
            return False
        
        for txt_file in folder.glob("*.txt"):
            with open(txt_file, 'r') as f:
                lines = f.readlines()
            
            updated = False
            for i, line in enumerate(lines):
                if line.startswith("Last Attendance:"):
                    lines[i] = f"Last Attendance: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
                    updated = True
                    break
            
            if not updated:
                lines.append(f"Last Attendance: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            
            with open(txt_file, 'w') as f:
                f.writelines(lines)
            return True
        return False
    
    def get_student_info(self, roll_no):
        folder = self.db_path / str(roll_no)
        if not folder.exists():
            return None
        
        for txt_file in folder.glob("*.txt"):
            with open(txt_file, 'r') as f:
                content = f.read()
            info = {}
            for line in content.strip().split('\n'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    info[key.strip()] = value.strip()
            return info
        return None
    
    def create_alert(self, roll_no, date, reason="Absent"):
        folder = self.db_path / str(roll_no)
        if not folder.exists():
            return False
        
        alert_file = folder / f"alert_{date}.txt"
        student_info = self.get_student_info(roll_no)
        
        with open(alert_file, 'w') as f:
            f.write(f"ATTENDANCE ALERT - {date}\n")
            f.write(f"Student: {student_info.get('Student Name', 'Unknown')}\n")
            f.write(f"Roll No: {roll_no}\n")
            f.write(f"Email: {student_info.get('Email', 'Unknown')}\n")
            f.write(f"Phone: {student_info.get('Phone', 'Unknown')}\n")
            f.write(f"Department: {student_info.get('Department', 'Unknown')}\n")
            f.write(f"Section: {student_info.get('Section', 'Unknown')}\n")
            f.write(f"Status: {reason}\n")
            f.write(f"Session Type: Live Camera Session\n")
            f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        
        # Send WhatsApp alert
        self.send_whatsapp_alert(student_info, date, reason)
        return True
    
    def send_whatsapp_alert(self, student_info, date, reason):
        """Send WhatsApp alert for absence"""
        try:
            import requests
            
            phone = student_info.get('Phone', '')
            if not phone:
                return False
            
            # Format phone number (remove +91 if present)
            phone = phone.replace('+91-', '').replace('+91', '').replace('-', '')
            
            message = f"🚨 ATTENDANCE ALERT\n\n"
            message += f"Dear {student_info.get('Student Name', 'Student')},\n\n"
            message += f"You were {reason} on {date}\n\n"
            message += f"📋 Details:\n"
            message += f"Roll No: {student_info.get('Roll Number', 'N/A')}\n"
            message += f"Department: {student_info.get('Department', 'N/A')}\n"
            message += f"Section: {student_info.get('Section', 'N/A')}\n\n"
            message += f"Please contact administration if this is incorrect.\n\n"
            message += f"- NeuroAttend AI System 🧠"
            
            # Using WhatsApp Business API (replace with your API)
            # For demo, we'll just log the message
            print(f"📱 WhatsApp Alert Sent to {phone}: {message}")
            
            return True
            
        except Exception as e:
            print(f"❌ WhatsApp alert failed: {e}")
            return False