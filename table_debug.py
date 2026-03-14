import mysql.connector

try:
    conn = mysql.connector.connect(host='localhost',port=3306,user='root',password='1324',database='smart_parking')
    cur = conn.cursor()
    cur.execute('SHOW TABLES')
    tables = [t[0].lower() for t in cur.fetchall()]
    
    print(f"Total tables: {len(tables)}")
    print(f"Contains 'slot': {'slot' in tables}")
    print(f"Contains 'parkingslot': {'parkingslot' in tables}")
    
    # List all tables starting with 's' or 'p'
    cur.execute("SHOW TABLES")
    all_tables = [t[0] for t in cur.fetchall()]
    s_p_tables = [t for t in all_tables if t.lower().startswith('s') or t.lower().startswith('p')]
    print(f"S/P Tables: {s_p_tables}")
    
    conn.close()
except Exception as e:
    print(f'Error: {e}')
