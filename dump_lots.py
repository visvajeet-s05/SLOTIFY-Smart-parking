import mysql.connector
import json

try:
    conn = mysql.connector.connect(host='localhost',port=3306,user='root',password='1324',database='smart_parking')
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT id, name, edgeNodeId, edgeToken, lastHeartbeat, status FROM parkinglot")
    lots = cur.fetchall()
    for lot in lots:
        if lot['lastHeartbeat']:
            lot['lastHeartbeat'] = lot['lastHeartbeat'].isoformat()
    print(json.dumps(lots, indent=2))
    conn.close()
except Exception as e:
    print(f"Error: {e}")
