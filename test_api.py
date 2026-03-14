import requests
import json

try:
    r = requests.get('http://localhost:3000/api/parking/CHENNAI_CENTRAL/slots')
    print(f'Status: {r.status_code}')
    data = r.json()
    slots = data.get("slots", [])
    print(f'Total Slots returned: {len(slots)}')
    if slots:
        print(f'First slot: {json.dumps(slots[0], indent=2)}')
    else:
        print('No slots found in response.')
except Exception as e:
    print(f'Error: {e}')
