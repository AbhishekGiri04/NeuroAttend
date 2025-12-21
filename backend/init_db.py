#!/usr/bin/env python3
import os
from database import init_database

def main():
    print("🗄️ Initializing NeuroAttend Database...")
    
    # Ensure database directory exists
    db_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database')
    os.makedirs(db_dir, exist_ok=True)
    print(f"📁 Database directory: {db_dir}")
    
    # Initialize database
    try:
        init_database()
        print("✅ Database tables created successfully!")
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    main()