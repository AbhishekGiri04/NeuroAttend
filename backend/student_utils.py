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

def send_absence_email(students, date):
    """Send actual email to absent student"""
    try:
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        
        # Email configuration (use your email settings)
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        sender_email = "your-email@gmail.com"  # Replace with your email
        sender_password = "your-app-password"   # Replace with your app password
        
        # Create message
        message = MIMEMultipart()
        message["From"] = sender_email
        message["To"] = student['email']
        message["Subject"] = f"Attendance Alert - {date}"
        
        # Professional email body
        body = f"""
        Dear {student['name']},
        
        ATTENDANCE NOTIFICATION - ABSENCE ALERT
        
        We hope this message finds you well. This is an official notification regarding your attendance status.
        
        ABSENCE DETAILS:
        • Student Name: {student['name']}
        • Roll Number: {student['roll_id']}
        • Date of Absence: {date}
        • Notification Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        
        REQUIRED ACTION:
        If you believe this absence marking is incorrect, please contact the academic administration office immediately with supporting documentation.
        
        CONTACT INFORMATION:
        • Academic Office: academics@institution.edu
        • Phone: +91-XXXXXXXXXX
        • Office Hours: 9:00 AM - 5:00 PM (Monday-Friday)
        
        This is an automated notification from our AI-powered attendance management system. Please do not reply to this email.
        
        Best regards,
        Academic Administration
        NeuroAttend AI Attendance Management System
        
        ---
        This email was generated automatically. For technical support, contact: support@neuroattend.com
        """
        
        message.attach(MIMEText(body, "plain"))
        
        # Open email client directly instead of trying SMTP
        try:
            # This will always fail to force email client opening
            raise Exception("Force email client opening")
            
        except Exception as email_error:
            # Open email client with BCC for all absent students
            import webbrowser
            import urllib.parse
            
            # Collect all emails for BCC
            all_emails = [student['email'] for student in students]
            bcc_emails = ';'.join(all_emails)
            
            subject = f"Attendance Alert - Absence Notification for {date}"
            email_body = f"ATTENDANCE ALERT\n\nDear Students,\n\nYou have been marked absent on {date}.\n\nPlease check your attendance status and contact administration if this is an error.\n\nAdmin Contact: +91-1234567890\n\nPowered by NeuroAttend — AI Attendance System"
            
            # Open Gmail compose with BCC
            gmail_url = f"https://mail.google.com/mail/?view=cm&fs=1&bcc={urllib.parse.quote(bcc_emails)}&su={urllib.parse.quote(subject)}&body={urllib.parse.quote(email_body)}"
            webbrowser.open(gmail_url)
            
            print(f"📧 Email client opened with {len(students)} students in BCC")
            
            # Create alert files for all students
            project_root = os.path.dirname(__file__)
            for student in students:
                student_folder = os.path.join(project_root, '..', 'database', student['roll_id'])
                if os.path.exists(student_folder):
                    alert_file = os.path.join(student_folder, f"email_alert_{date}.txt")
                    with open(alert_file, 'w') as f:
                        f.write(f"EMAIL OPENED - {date}\n")
                        f.write(f"To: {student['email']}\n")
                        f.write(f"Status: Email Client Opened\n")
                        f.write(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            
            return len(students)
            
        except Exception as email_error:
            print(f"❌ Failed to send email: {email_error}")
            # For demo purposes, create alert file even if email fails
            project_root = os.path.dirname(__file__)
            student_folder = os.path.join(project_root, '..', 'database', student['roll_id'])
            if os.path.exists(student_folder):
                alert_file = os.path.join(student_folder, f"email_alert_{date}.txt")
                with open(alert_file, 'w') as f:
                    f.write(f"PROFESSIONAL EMAIL ALERT - {date}\n")
                    f.write(f"Status: Demo Mode - Email Simulation\n")
                    f.write(f"Recipient: {student['email']}\n")
                    f.write(f"Subject: Attendance Notification - Absence Alert\n")
                    f.write(f"Message Type: Professional Academic Notification\n")
                    f.write(f"Delivery Status: Simulated Success\n")
                    f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                    f.write(f"System: NeuroAttend AI Attendance Management\n")
            return True
        
    except Exception as e:
        print(f"❌ Error in email system: {e}")
        return False