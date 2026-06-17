import sqlite3
import os

def run_sql_file(cursor, file_path):
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found.")
        return False
        
    print(f"Executing {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        sql = f.read()
        
    # sqlite3 executescript handles multiple statements separated by semicolons
    try:
        cursor.executescript(sql)
        print(f"Successfully executed {file_path}")
        return True
    except Exception as e:
        print(f"Error executing {file_path}: {e}")
        return False

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(base_dir, 'truy_xuat_nguon_goc.db')
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Run the SQL scripts
    run_sql_file(cursor, os.path.join(base_dir, 'nhan_vien.sql'))
    run_sql_file(cursor, os.path.join(base_dir, 'khach_hang.sql'))
    
    conn.commit()
    conn.close()
    print("Database import complete.")

if __name__ == '__main__':
    main()
