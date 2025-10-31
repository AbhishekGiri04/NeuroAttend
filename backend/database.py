import sqlite3
import pickle
import numpy as np
import os
from datetime import datetime, timedelta

def init_database():
    # Database file in project root/database folder
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database', 'attendance.db')
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    print(f"Database path: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("Creating database tables...")
    
    # Students table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            roll_id TEXT UNIQUE NOT NULL,
            email TEXT,
            face_encoding BLOB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Attendance table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER,
            date DATE,
            time TIME,
            status TEXT DEFAULT 'present',
            FOREIGN KEY (student_id) REFERENCES students (id)
        )
    ''')
    
    # ID verification table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS id_verifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER,
            roll_number TEXT,
            id_card_encoding BLOB,
            is_verified BOOLEAN,
            face_distance REAL,
            verification_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students (id)
        )
    ''')
    
    conn.commit()
    print("Database tables created successfully")
    conn.close()

def save_student(name, roll_id, email, face_encoding):
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database', 'attendance.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Convert face encoding to binary for database storage
        encoding_blob = pickle.dumps(face_encoding)
        
        # Insert student data with face encoding for live cam verification
        cursor.execute('''
            INSERT INTO students (name, roll_id, email, face_encoding)
            VALUES (?, ?, ?, ?)
        ''', (name, roll_id, email, encoding_blob))
        
        conn.commit()
        student_id = cursor.lastrowid
        print(f"✅ Student {name} (Roll: {roll_id}) saved to database with ID: {student_id}")
        return student_id
        
    except sqlite3.IntegrityError:
        print(f"❌ Roll number {roll_id} already exists")
        raise Exception(f"Roll number {roll_id} already exists")
    finally:
        conn.close()

def get_all_students():
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database', 'attendance.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        cursor.execute('SELECT id, name, roll_id, email, face_encoding FROM students')
        students = cursor.fetchall()
        
        # Convert binary back to numpy arrays for live cam verification
        result = []
        for student in students:
            id, name, roll_id, email, encoding_blob = student
            face_encoding = pickle.loads(encoding_blob)
            result.append({
                'id': id,
                'name': name,
                'roll_id': roll_id,
                'email': email,
                'face_encoding': face_encoding
            })
        
        print(f"📚 Loaded {len(result)} enrolled students for live cam verification")
        return result
        
    finally:
        conn.close()

def mark_attendance(student_id):
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database', 'attendance.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    today = datetime.now().strftime('%Y-%m-%d')
    current_time = datetime.now().strftime('%H:%M:%S')
    
    # Check if already marked today
    cursor.execute('''
        SELECT id FROM attendance 
        WHERE student_id = ? AND date = ?
    ''', (student_id, today))
    
    if cursor.fetchone() is None:
        cursor.execute('''
            INSERT INTO attendance (student_id, date, time)
            VALUES (?, ?, ?)
        ''', (student_id, today, current_time))
        conn.commit()
        print(f"✅ Student {student_id} marked present at {current_time}")
        conn.close()
        return True
    
    print(f"⚠️ Student {student_id} already marked present today")
    conn.close()
    return False

def get_attendance_stats():
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database', 'attendance.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    today = datetime.now().strftime('%Y-%m-%d')
    
    # Present today
    cursor.execute('''
        SELECT COUNT(*) FROM attendance WHERE date = ?
    ''', (today,))
    present_today = cursor.fetchone()[0]
    
    # Total students
    cursor.execute('SELECT COUNT(*) FROM students')
    total_students = cursor.fetchone()[0]
    
    # Absent today
    absent_today = total_students - present_today
    
    # Attendance rate
    attendance_rate = (present_today / total_students * 100) if total_students > 0 else 0
    
    # Weekly trend (last 7 days)
    weekly_trend = []
    for i in range(6, -1, -1):
        date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
        cursor.execute('''
            SELECT COUNT(*) FROM attendance WHERE date = ?
        ''', (date,))
        count = cursor.fetchone()[0]
        rate = (count / total_students * 100) if total_students > 0 else 0
        weekly_trend.append({
            'date': date,
            'attendance': count,
            'rate': round(rate, 1)
        })
    
    # Top students (most active)
    cursor.execute('''
        SELECT s.name, s.roll_id, COUNT(a.id) as attendance_count
        FROM students s
        LEFT JOIN attendance a ON s.id = a.student_id
        GROUP BY s.id, s.name, s.roll_id
        ORDER BY attendance_count DESC
        LIMIT 5
    ''')
    
    top_students = cursor.fetchall()
    top_users = []
    for student in top_students:
        name, roll_id, count = student
        top_users.append({
            'name': name,
            'roll_id': roll_id,
            'attendance_count': count,
            'attendance_rate': round((count / 30 * 100), 1) if count > 0 else 0  # Assuming 30 days max
        })
    
    conn.close()
    
    return {
        'today_present': present_today,
        'absent_count': absent_today,
        'total_users': total_students,
        'attendance_rate': round(attendance_rate, 1),
        'weekly_trend': weekly_trend,
        'top_users': top_users
    }

def get_student_by_roll_id(roll_id):
    """Get student by roll number"""
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database', 'attendance.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        cursor.execute('SELECT id, name, roll_id, email, face_encoding FROM students WHERE roll_id = ?', (roll_id,))
        student = cursor.fetchone()
        
        if student:
            id, name, roll_id, email, encoding_blob = student
            face_encoding = pickle.loads(encoding_blob)
            return {
                'id': id,
                'name': name,
                'roll_id': roll_id,
                'email': email,
                'face_encoding': face_encoding
            }
        return None
        
    finally:
        conn.close()

def save_id_card_verification(student_id, roll_number, id_card_encoding, is_verified, face_distance, photo_path=None):
    """Save ID card verification result with photo path"""
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database', 'attendance.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Convert face encoding to binary
        encoding_blob = pickle.dumps(id_card_encoding)
        
        # Add photo_path column if not exists
        cursor.execute("PRAGMA table_info(id_verifications)")
        columns = [column[1] for column in cursor.fetchall()]
        if 'photo_path' not in columns:
            cursor.execute('ALTER TABLE id_verifications ADD COLUMN photo_path TEXT')
        
        cursor.execute('''
            INSERT INTO id_verifications (student_id, roll_number, id_card_encoding, is_verified, face_distance, photo_path)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (student_id, roll_number, encoding_blob, is_verified, face_distance, photo_path))
        
        conn.commit()
        verification_id = cursor.lastrowid
        
        status = "✅ VERIFIED" if is_verified else "❌ NOT VERIFIED"
        print(f"{status} - Roll: {roll_number}, Distance: {face_distance:.3f}, Photo: {photo_path}")
        
        return verification_id
        
    finally:
        conn.close()

def get_all_id_verifications():
    """Get all ID card verifications for duplicate checking"""
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database', 'attendance.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            SELECT iv.student_id, iv.roll_number, iv.id_card_encoding, s.name
            FROM id_verifications iv
            JOIN students s ON iv.student_id = s.id
        ''')
        
        verifications = cursor.fetchall()
        
        result = []
        for verification in verifications:
            student_id, roll_number, encoding_blob, student_name = verification
            id_card_encoding = pickle.loads(encoding_blob)
            result.append({
                'student_id': student_id,
                'roll_number': roll_number,
                'id_card_encoding': id_card_encoding,
                'student_name': student_name
            })
        
        return result
        
    finally:
        conn.close()

def get_present_students_by_date(date):
    """Get students present on a specific date"""
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database', 'attendance.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            SELECT student_id, date, time FROM attendance 
            WHERE date = ?
        ''', (date,))
        
        present_students = cursor.fetchall()
        
        result = []
        for student in present_students:
            student_id, date, time = student
            result.append({
                'student_id': student_id,
                'date': date,
                'time': time
            })
        
        return result
        
    finally:
        conn.close()