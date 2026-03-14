import mysql.connector

EDGE_TOKEN = "slotify-secure-edge-token-2024"

try:
    conn = mysql.connector.connect(host='localhost',port=3306,user='root',password='1324',database='smart_parking')
    cur = conn.cursor()
    
    lots = ['CHENNAI_CENTRAL', 'VELACHERY', 'ADYAR', 'ANNA_NAGAR', 'T_NAGAR', 'OMR', 'GUINDY', 'PORUR']
    
    print("Activating all lots with unique Edge IDs...")
    
    for lot in lots:
        # Generate a unique ID based on the lot name
        unique_id = f"edge-{lot.lower().replace('_', '-')}-01"
        
        # We need to clear any existing records with these IDs first to avoid collisions if we rerun
        cur.execute("UPDATE parkinglot SET edgeNodeId = NULL, edgeToken = NULL WHERE edgeNodeId = %s", (unique_id,))
        
        cur.execute(
            "UPDATE parkinglot SET edgeNodeId = %s, edgeToken = %s, lastHeartbeat = NOW() WHERE id = %s",
            (unique_id, EDGE_TOKEN, lot)
        )
        print(f"✅ {lot} activated with ID: {unique_id}")
    
    conn.commit()
    conn.close()
    print("\n--- All lots are now ONLINE in the database ---")
except Exception as e:
    print(f'Error: {e}')
