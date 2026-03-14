import mysql.connector

try:
    conn = mysql.connector.connect(host='localhost',port=3306,user='root',password='1324',database='smart_parking')
    cur = conn.cursor()
    
    lots = ['CHENNAI_CENTRAL', 'VELACHERY', 'ADYAR', 'ANNA_NAGAR', 'T_NAGAR', 'OMR', 'GUINDY', 'PORUR']
    
    print("Activating all lots with unique Edge IDs and Tokens...")
    
    for lot in lots:
        unique_id = f"edge-{lot.lower().replace('_', '-')}-01"
        unique_token = f"token-{lot.lower().replace('_', '-')}-secret"
        
        # Reset any existing row that might have these unique keys
        cur.execute("UPDATE parkinglot SET edgeNodeId = NULL, edgeToken = NULL WHERE edgeNodeId = %s OR edgeToken = %s", (unique_id, unique_token))
        
        cur.execute(
            "UPDATE parkinglot SET edgeNodeId = %s, edgeToken = %s, lastHeartbeat = NOW() WHERE id = %s",
            (unique_id, unique_token, lot)
        )
        print(f"✅ {lot} -> ID: {unique_id}")
    
    conn.commit()
    conn.close()
    print("\n🚀 SUCCESS: All parking systems are now 'OPERATIONAL' in the DB.")
except Exception as e:
    print(f'Error: {e}')
