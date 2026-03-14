import mysql.connector

try:
    conn = mysql.connector.connect(host='localhost',port=3306,user='root',password='1324',database='smart_parking')
    cur = conn.cursor()
    cur.execute('SHOW TABLES')
    tables = cur.fetchall()
    print('Tables in database:')
    for table in tables:
        print(f'- {table[0]}')
    
    cur.execute('SELECT COUNT(*) FROM Slot WHERE lotId = "CHENNAI_CENTRAL"')
    print(f'Slot count for CHENNAI_CENTRAL: {cur.fetchone()[0]}')
    
    cur.execute('SELECT COUNT(*) FROM Slot WHERE lotId = "VELACHERY"')
    print(f'Slot count for VELACHERY: {cur.fetchone()[0]}')
    
    conn.close()
except Exception as e:
    print(f'Error: {e}')
