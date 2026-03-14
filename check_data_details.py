import mysql.connector

try:
    conn = mysql.connector.connect(host='localhost',port=3306,user='root',password='1324',database='smart_parking')
    cur = conn.cursor()
    
    print("--- Slot Table Structure ---")
    cur.execute("DESCRIBE Slot")
    for col in cur.fetchall():
        print(col)
        
    print("\n--- Parking Lot Statuses ---")
    cur.execute("SELECT id, name, status FROM parkinglot")
    for row in cur.fetchall():
        print(row)
        
    print("\n--- Slot Samples (Chennai Central) ---")
    cur.execute("SELECT id, slotNumber, x, y, width, height FROM Slot WHERE lotId = 'CHENNAI_CENTRAL' LIMIT 5")
    for row in cur.fetchall():
        print(row)
        
    conn.close()
except Exception as e:
    print(f'Error: {e}')
