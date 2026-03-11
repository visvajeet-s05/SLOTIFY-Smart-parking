import os
import json
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

# We only train the model when the server starts or periodically
_models = {}

def get_db_connection():
    # Parse generic DB URL from Next.js Prisma config into MySQL connection
    db_url = os.getenv('DATABASE_URL', '')
    if not db_url:
        return None
        
    try:
        # Example format: mysql://user:pass@host:port/dbname
        auth, host_db = db_url.replace('mysql://', '').split('@')
        user, password = auth.split(':')
        host_port, dbname = host_db.split('/')
        host, port = host_port.split(':')
        
        return mysql.connector.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=dbname
        )
    except Exception as e:
        print(f"Error connecting to DB: {e}")
        return None

def train_model():
    print("Training ML Demand Prediction Model...")
    conn = get_db_connection()
    if not conn:
        print("Could not connect to database for training. Skipping.")
        return False
        
    try:
        query = "SELECT parkingId, hour, date, demandScore FROM demandprediction"
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query)
        rows = cursor.fetchall()
        df = pd.DataFrame(rows)
        cursor.close()
        
        if df.empty or len(df) < 50:
            print("Not enough historical data to train model. Need at least 50 records.")
            return False
            
        # Feature Engineering
        df['date'] = pd.to_datetime(df['date'])
        df['dayOfWeek'] = df['date'].dt.dayofweek
        df['isWeekend'] = df['dayOfWeek'].isin([5, 6]).astype(int)
        
        # Train a model for each parking lot
        parking_lots = df['parkingId'].unique()
        
        for lot_id in parking_lots:
            lot_data = df[df['parkingId'] == lot_id]
            
            X = lot_data[['hour', 'dayOfWeek', 'isWeekend']]
            y = lot_data['demandScore']
            
            model = RandomForestRegressor(n_estimators=50, random_state=42)
            model.fit(X, y)
            
            _models[lot_id] = model
            
        print(f"Successfully trained models for {len(parking_lots)} parking lots.")
        return True
        
    except Exception as e:
        print(f"Training failed: {e}")
        return False
    finally:
        conn.close()

def predict_occupancy(parking_id, target_time_iso):
    """
    Predicts the occupancy rate (0.0 to 1.0) for a specific time and lot.
    """
    if not _models:
        success = train_model()
        if not success:
            return None
            
    if parking_id not in _models:
        return None
        
    try:
        target_dt = datetime.fromisoformat(target_time_iso.replace('Z', '+00:00'))
        
        X_pred = pd.DataFrame([{
            'hour': target_dt.hour,
            'dayOfWeek': target_dt.weekday(),
            'isWeekend': 1 if target_dt.weekday() >= 5 else 0
        }])
        
        prediction = _models[parking_id].predict(X_pred)[0]
        
        # Bound the prediction between 0 and 1
        return max(0.0, min(1.0, float(prediction)))
        
    except Exception as e:
        print(f"Prediction error: {e}")
        return None

if __name__ == "__main__":
    train_model()
    # Test
    now = datetime.now().isoformat()
    print(f"Test prediction: {predict_occupancy('some_id', now)}")
