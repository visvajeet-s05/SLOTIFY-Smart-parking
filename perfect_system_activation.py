import mysql.connector
import time

try:
    conn = mysql.connector.connect(host='localhost',port=3306,user='root',password='1324',database='smart_parking')
    cur = conn.cursor(dictionary=True)
    
    lots = ['CHENNAI_CENTRAL', 'VELACHERY', 'ADYAR', 'ANNA_NAGAR', 'T_NAGAR', 'OMR', 'GUINDY', 'PORUR']
    
    print("🚀 STARTING GLOBAL STANDARD SYSTEM ACTIVATION...")
    
    for lot_id in lots:
        unique_id = f"edge-{lot_id.lower().replace('_', '-')}-01"
        unique_token = f"token-{lot_id.lower().replace('_', '-')}-secret"
        
        # 1. Activate Parking Lot
        print(f"\n--- Processing {lot_id} ---")
        cur.execute(
            "UPDATE parkinglot SET status = 'ACTIVE', edgeNodeId = %s, edgeToken = %s, lastHeartbeat = NOW() WHERE id = %s",
            (unique_id, unique_token, lot_id)
        )
        print(f"✅ Lot {lot_id} set to ACTIVE with unique credentials.")

        # 2. Fix Slots (Generate Grid Coordinates if missing)
        cur.execute("SELECT id, slotNumber FROM Slot WHERE lotId = %s ORDER BY slotNumber", (lot_id,))
        slots = cur.fetchall()
        
        if not slots:
            print(f"⚠️ No slots found for {lot_id}")
            continue
            
        print(f"⚙️  Mapping coordinates for {len(slots)} slots...")
        cols = 6
        width, height = 240, 140
        padding_x, padding_y = 40, 40
        start_x, start_y = 150, 150
        
        for idx, s in enumerate(slots):
            row = idx // cols
            col = idx % cols
            x = start_x + (col * (width + padding_x))
            y = start_y + (row * (height + padding_y))
            
            cur.execute(
                "UPDATE Slot SET x = %s, y = %s, width = %s, height = %s, status = 'AVAILABLE' WHERE id = %s",
                (x, y, width, height, s['id'])
            )
        
        print(f"✅ All {len(slots)} slots calibrated and visible.")

    conn.commit()
    conn.close()
    print("\n🏆 SYSTEM ACTIVATION COMPLETE: All stats should now be populated and slots visible!")
except Exception as e:
    print(f'❌ Error during activation: {e}')
