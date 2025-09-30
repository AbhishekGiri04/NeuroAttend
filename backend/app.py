from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from database import init_database, save_student, get_attendance_stats, get_all_students, mark_attendance, get_present_students_by_date
from face_recognition_service import FaceRecognitionService
from id_verification_service import IDVerificationService
from student_utils import send_absence_email
from db_manager import StudentDB
import tempfile
import os
import shutil

app = FastAPI(title="NeuroAttend API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database and services
init_database()
face_service = FaceRecognitionService()
id_verification_service = IDVerificationService()
student_db = StudentDB()

@app.on_event("startup")
async def startup_event():
    print("🚀 NeuroAttend API Started")
    print("🤖 Face Recognition Service Initialized")
    print("🆔 ID Verification Service Ready")

@app.post("/enroll")
async def enroll_student(
    name: str = Form(...),
    roll_id: str = Form(...),
    email: str = Form(...),
    phone: str = Form(""),
    department: str = Form(""),
    section: str = Form(""),
    file: UploadFile = File(...)
):
    """Enroll a new student with facial recognition"""
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        # Extract face encoding
        face_encoding = face_service.encode_face_from_image(temp_file_path)
        
        if face_encoding is None:
            os.unlink(temp_file_path)
            raise HTTPException(status_code=400, detail="No face detected in image")
        
        # Check for duplicate face
        duplicate_student = face_service.check_duplicate_face(face_encoding)
        if duplicate_student:
            os.unlink(temp_file_path)
            raise HTTPException(status_code=400, detail=f"This face is already enrolled for student: {duplicate_student['name']} ({duplicate_student['roll_id']})")
        
        # Save student data using roll number structure
        student_db.create_student(roll_id, name, email, phone, department, section)
        student_db.save_photo(roll_id, content)
        
        # Clean up temp file
        os.unlink(temp_file_path)
        
        if face_encoding is None:
            raise HTTPException(status_code=400, detail="No face detected in image")
        
        # Save to database
        student_id = save_student(name, roll_id, email, face_encoding)
        
        # Reload known faces
        face_service.load_known_faces()
        
        return JSONResponse({
            "message": "Enrollment Successful! Student registered for attendance tracking.",
            "student_id": student_id,
            "student_name": name,
            "roll_number": roll_id,
            "photo_saved": f"{roll_id}.jpg",
            "status": "enrolled"
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recognize")
async def recognize_faces(frame_data: dict):
    """Process video frame for face recognition"""
    try:
        frame = frame_data.get("frame")
        if not frame:
            raise HTTPException(status_code=400, detail="No frame data provided")
        
        results = face_service.process_frame(frame)
        return JSONResponse({"results": results})
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
async def get_stats():
    """Get attendance statistics"""
    try:
        stats = get_attendance_stats()
        return JSONResponse(stats)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/bulk-enroll")
async def bulk_enroll(
    csv_file: UploadFile = File(...),
    photos_zip: UploadFile = File(...)
):
    """Bulk enrollment from CSV and photos ZIP"""
    try:
        import csv
        import zipfile
        import tempfile
        import shutil
        
        enrolled = []
        failed = []
        
        # Create temporary directories
        with tempfile.TemporaryDirectory() as temp_dir:
            # Save CSV file
            csv_path = os.path.join(temp_dir, "students.csv")
            with open(csv_path, "wb") as f:
                f.write(await csv_file.read())
            
            # Extract ZIP file
            zip_path = os.path.join(temp_dir, "photos.zip")
            with open(zip_path, "wb") as f:
                f.write(await photos_zip.read())
            
            photos_dir = os.path.join(temp_dir, "photos")
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(photos_dir)
            
            # Read CSV and process each student
            with open(csv_path, 'r') as csvfile:
                reader = csv.DictReader(csvfile)
                
                for row in reader:
                    try:
                        name = row['name'].strip()
                        roll_id = row['roll_id'].strip()
                        email = row['email'].strip()
                        phone = row.get('phone', '').strip()
                        department = row.get('department', '').strip()
                        section = row.get('section', '').strip()
                        photo_filename = row['photo'].strip()
                        
                        # Find photo file
                        photo_path = None
                        for root, dirs, files in os.walk(photos_dir):
                            if photo_filename in files:
                                photo_path = os.path.join(root, photo_filename)
                                break
                        
                        if not photo_path or not os.path.exists(photo_path):
                            failed.append({"name": name, "roll_id": roll_id, "error": "Photo not found"})
                            continue
                        
                        # Extract face encoding
                        face_encoding = face_service.encode_face_from_image(photo_path)
                        
                        if face_encoding is None:
                            failed.append({"name": name, "roll_id": roll_id, "error": "No face detected"})
                            continue
                        
                        # Check for duplicate face
                        duplicate_student = face_service.check_duplicate_face(face_encoding)
                        if duplicate_student:
                            failed.append({"name": name, "roll_id": roll_id, "error": f"Face already enrolled for {duplicate_student['name']} ({duplicate_student['roll_id']})"})
                            continue
                        
                        # Save student data using roll number structure
                        student_db.create_student(roll_id, name, email, phone, department, section)
                        with open(photo_path, 'rb') as f:
                            photo_data = f.read()
                        student_db.save_photo(roll_id, photo_data)
                        
                        # Save to database
                        student_id = save_student(name, roll_id, email, face_encoding)
                        enrolled.append({"name": name, "roll_id": roll_id, "student_id": student_id, "photo_saved": f"{roll_id}.jpg"})
                        
                    except Exception as e:
                        failed.append({"name": row.get('name', 'Unknown'), "roll_id": row.get('roll_id', 'Unknown'), "error": str(e)})
        
        # Reload known faces
        face_service.load_known_faces()
        
        return JSONResponse({
            "message": f"Bulk enrollment completed. Enrolled: {len(enrolled)}, Failed: {len(failed)}",
            "enrolled": enrolled,
            "failed": failed,
            "total_processed": len(enrolled) + len(failed)
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/send-alerts")
async def send_alerts(date: str = Form(...)):
    """Send absence alerts to students who are absent"""
    try:
        from datetime import datetime
        
        # Get all students
        all_students = get_all_students()
        
        # Get students present on given date
        present_students = get_present_students_by_date(date)
        present_ids = [s['student_id'] for s in present_students]
        
        # Find absent students
        absent_students = [s for s in all_students if s['id'] not in present_ids]
        
        alerts_sent = []
        alerts_failed = []
        
        for student in absent_students:
            try:
                # Send absence alert via email and WhatsApp
                email_sent = send_absence_email(student, date)
                whatsapp_sent = student_db.create_alert(student['roll_id'], date, "Absent")
                
                if email_sent or whatsapp_sent:
                    alert_result = {
                        'name': student['name'],
                        'roll_id': student['roll_id'],
                        'email': student['email'],
                        'status': 'sent',
                        'message': f'Alert sent via email and WhatsApp to {student["name"]}'
                    }
                    alerts_sent.append(alert_result)
                else:
                    alerts_failed.append({
                        'name': student['name'],
                        'roll_id': student['roll_id'],
                        'error': 'Both email and WhatsApp sending failed'
                    })
                
            except Exception as e:
                alerts_failed.append({
                    'name': student['name'],
                    'roll_id': student['roll_id'],
                    'error': str(e)
                })
        
        return JSONResponse({
            "message": f"Absence alerts processed. Sent: {len(alerts_sent)}, Failed: {len(alerts_failed)}",
            "date": date,
            "alerts_sent": alerts_sent,
            "alerts_failed": alerts_failed,
            "total_absent": len(absent_students)
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/verify-id")
async def verify_id_card(
    roll_number: str = Form(...),
    file: UploadFile = File(...)
):
    """Verify ID card photo matches enrolled student"""
    try:
        # Save uploaded ID card temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        # Verify ID card
        result = id_verification_service.verify_id_card(roll_number, temp_file_path)
        
        # Clean up temp file
        os.unlink(temp_file_path)
        
        return JSONResponse(result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/test-mark-present")
async def test_mark_present():
    """Test marking attendance for enrolled student"""
    try:
        # Get first enrolled student
        students = get_all_students()
        if not students:
            return JSONResponse({"error": "No students enrolled"})
        
        student = students[0]
        
        # Mark attendance
        attendance_marked = mark_attendance(student['id'])
        
        return JSONResponse({
            "success": True,
            "student_name": student['name'],
            "roll_number": student['roll_id'],
            "attendance_marked": attendance_marked,
            "message": f"Attendance marked for {student['name']} ({student['roll_id']})"
        })
        
    except Exception as e:
        return JSONResponse({"error": str(e)})

@app.post("/mark-session-attendance")
async def mark_session_attendance(data: dict):
    """Record attendance for current session only"""
    try:
        session_time = data.get('session_time')
        present_students = data.get('present_students', [])
        
        # Get all enrolled students
        all_students = get_all_students()
        
        # Find students who were not detected in this session
        absent_students = []
        present_count = len(present_students)
        
        for student in all_students:
            if student['roll_id'] not in present_students:
                absent_students.append(student)
                # Create session alert file
                session_date = session_time.split('T')[0]
                student_db.create_alert(student['roll_id'], session_date, "Not Detected in Session")
        
        return JSONResponse({
            "message": f"Session attendance recorded",
            "session_time": session_time,
            "present_count": present_count,
            "absent_count": len(absent_students),
            "not_detected": [s['name'] for s in absent_students[:5]]
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/export-absentees")
async def export_absentees(date: str):
    """Export absentees report for given date"""
    try:
        import csv
        from io import StringIO
        from fastapi.responses import StreamingResponse
        
        # Get all students
        all_students = get_all_students()
        
        # Get students present on given date
        present_students = get_present_students_by_date(date)
        present_ids = [s['student_id'] for s in present_students]
        
        # Find absent students
        absent_students = [s for s in all_students if s['id'] not in present_ids]
        
        # Create CSV content
        output = StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow(['Name', 'Roll Number', 'Email', 'Status', 'Date'])
        
        # Write absent students
        for student in absent_students:
            writer.writerow([
                student['name'],
                student['roll_id'],
                student['email'],
                'Absent',
                date
            ])
        
        # Write present students
        for present in present_students:
            student = next((s for s in all_students if s['id'] == present['student_id']), None)
            if student:
                writer.writerow([
                    student['name'],
                    student['roll_id'],
                    student['email'],
                    'Present',
                    date
                ])
        
        output.seek(0)
        
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=attendance_report_{date}.csv"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)