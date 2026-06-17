import sqlite3
import json
import os

def main():
    # Paths relative to the script location or project root
    # Project root is d:/BA/department-dashboard
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(base_dir, 'truy_xuat_nguon_goc.db')
    output_path = os.path.join(base_dir, 'src', 'utils', 'traceabilityData.js')
    
    if not os.path.exists(db_path):
        print(f"Error: Database file not found at {db_path}")
        return
        
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    try:
        # 1. Read traceability
        cursor.execute("SELECT * FROM truy_xuat_nguon_goc;")
        trace_rows = [dict(row) for row in cursor.fetchall()]
        
        # 2. Read personnel
        cursor.execute("SELECT * FROM nhan_vien;")
        personnel_rows = [dict(row) for row in cursor.fetchall()]
        
        # 3. Read customers
        cursor.execute("SELECT * FROM khach_hang;")
        customer_rows = [dict(row) for row in cursor.fetchall()]
        
        # Write all to JS file
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write("// Automatically generated from truy_xuat_nguon_goc.db. Do not edit directly.\n\n")
            
            f.write("export const traceabilityData = ")
            json.dump(trace_rows, f, indent=2, ensure_ascii=False)
            f.write(";\n\n")
            
            f.write("export const personnelData = ")
            json.dump(personnel_rows, f, indent=2, ensure_ascii=False)
            f.write(";\n\n")
            
            f.write("export const customerData = ")
            json.dump(customer_rows, f, indent=2, ensure_ascii=False)
            f.write(";\n")
            
        print(f"Successfully exported tables (trace: {len(trace_rows)}, personnel: {len(personnel_rows)}, customers: {len(customer_rows)}) to {output_path}")
    except Exception as e:
        print(f"Error reading database: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    main()
