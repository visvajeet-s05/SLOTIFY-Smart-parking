import mysql.connector

try:
    conn = mysql.connector.connect(host='localhost',port=3306,user='root',password='1324',database='smart_parking')
    cur = conn.cursor()
    
    print("--- ParkingLot Table Structure ---")
    cur.execute("DESCRIBE parkinglot")
    for col in cur.fetchall():
        print(col)
        
    print("\n--- CHENNAI_CENTRAL Row ---")
    cur.execute("SELECT id, name, edgeNodeId, lastHeartbeat, edgeToken FROM parkinglot WHERE id = 'CHENNAI_CENTRAL'")
    row = cur.fetchone()
    print(row)
    
    conn.close()
except Exception as e:
    print(f'Error: {e}')
