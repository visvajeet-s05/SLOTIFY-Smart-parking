import re

target_file = 'opencv-service/main.py'
try:
    with open(target_file, 'r', encoding='utf-8') as f:
        content = f.read()
except:
    with open(target_file, 'r', encoding='latin-1') as f:
        content = f.read()

new_p = '''CAR_PROFILES = {
    "911_RED":        [(0, 110, 80),      (15, 255, 255),  (165, 110, 80), (180, 255, 255)], # Strong Red
    "BLUE_POLICE":    [(90, 110, 60),     (145, 255, 255)],                                 # Strong Blue
    "GREEN_POLICE":   [(35, 110, 60),     (95, 255, 255)],                                  # Strong Green
    "BLACK_POLICE":   [(0, 0, 0),        (180, 255, 50)],                                   # Black/Shadow
    "CARTOON_ART":    [(15, 110, 80),     (45, 255, 255)],                                  # Strong Orange
    "DINOSAUR":       [(5, 110, 50),      (30, 255, 180)],                                  # Strong Maroon
    "WHITE_ROOFS":    [(0, 0, 180),      (180, 60, 255)],                                   # Bright White
}'''

# Match exactly what is in the file right now
old_p_pattern = r'CAR_PROFILES = \{.*?\}'
updated = re.sub(old_p_pattern, new_p, content, flags=re.DOTALL)

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(updated)
print("SUCCESSFULLY UPDATED CAR_PROFILES")
