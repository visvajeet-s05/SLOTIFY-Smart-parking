import mysql.connector
import os
from dotenv import load_dotenv

# Load .env to get database credentials
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

def parse_db_url(url: str) -> dict | None:
    try:
        url = url.strip().strip('"').strip("'")
        if not url.startswith("mysql://"):
            return None
        rest = url.replace("mysql://", "")
        auth, host_db = rest.split("@", 1)
        user, password = auth.split(":", 1)
        host_port, dbname = host_db.split("/", 1)
        host, port = (host_port.split(":", 1) if ":" in host_port
                      else (host_port, "3306"))
        return dict(host=host, port=int(port), user=user,
                    password=password, database=dbname)
    except Exception as e:
        print(f"[ERROR] DB URL parse error: {e}")
        return None

params = parse_db_url(DATABASE_URL) or {
    "host": "localhost",
    "user": "root",
    "password": "1324",
    "database": "smart_parking"
}

try:
    conn = mysql.connector.connect(**params)
    cursor = conn.cursor()
    new_url = "http://10.68.195.57:8080/video"
    
    # Tables to update based on schema.prisma
    # parkinglot has cameraUrl
    # Camera has url
    
    updates = [
        ("parkinglot", "cameraUrl"),
        ("ParkingLot", "cameraUrl"),
        ("Camera", "url"),
        ("camera", "url")
    ]
    
    for table, column in updates:
        try:
            cursor.execute(f"UPDATE {table} SET {column} = %s", (new_url,))
            if cursor.rowcount > 0:
                print(f"SUCCESS: Updated {column} in '{table}' table ({cursor.rowcount} rows)")
            else:
                print(f"INFO: No rows updated in '{table}' table")
        except Exception as e:
            # Silence "Table doesn't exist" or "Unknown column" errors as we are guessing names
            pass
            
    conn.commit()
    print(f"DONE: Database update attempt finished for {new_url}")
    conn.close()
except Exception as e:
    print(f"CONNECTION FAILED: {e}")
