import re
import urllib.request, json
from thefuzz import process, fuzz
import sys

# Ensure utf-8 output to avoid charmap errors in Windows console
sys.stdout.reconfigure(encoding='utf-8')

data = json.loads(urllib.request.urlopen('http://localhost:8000/food').read())
food_names = [f"{f['name_en']} {f.get('name_bn', '')}" for f in data]

meal_text = "2 pieces of bread and an egg"
parts = re.split(r',| and | with | & | \+ ', meal_text.lower())

print(f"Parts after split: {parts}")
for part in parts:
    part = part.strip()
    # Strip quantity numbers, units, articles
    clean = re.sub(r'^\d+\s*(cups?|pieces?|bowls?|plates?|grams?|kg|ml|g)?\s*(of\s+)?', '', part).strip()
    clean = re.sub(r'^(a|an)\s+', '', clean).strip()
    print(f"\n  Part: '{part}' -> cleaned: '{clean}'")
    best = process.extractOne(clean, food_names, scorer=fuzz.token_set_ratio)
    print(f"  Best match: {best}")
