import mysql.connector
import os
from dotenv import load_dotenv

# Load config
load_dotenv(dotenv_path='../.env.local')
load_dotenv(dotenv_path='../.env')

EDGE_ID = "edge-device-tamilnadu-01"
EDGE_TOKEN = "slotify-secure-edge-token-2024"

try:
    conn = mysql.connector.connect(host='localhost',port=3306,user='root',password='1324',database='smart_parking')
    cur = conn.cursor()
    
    # Update ALL lots to use the developer's local edge credentials for testing/dev
    # This ensures "everything is turned on" as requested
    lots = ['CHENNAI_CENTRAL', 'VELACHERY', 'ADYAR', 'ANNA_NAGAR', 'T_NAGAR', 'OMR', 'GUINDY', 'PORUR']
    
    print(f"Assigning edge node {EDGE_ID} to lots...")
    
    for lot in lots:
        cur.execute(
            "UPDATE parkinglot SET edgeNodeId = %s, edgeToken = %s, lastHeartbeat = NOW() WHERE id = %s",
            (EDGE_ID, EDGE_TOKEN, lot)
        )
        print(f"Updated {lot}")
    
    conn.commit()
    print("--- Database sync complete ---")
    
    conn.close()
except Exception as e:
    print(f'Error: {e}')
