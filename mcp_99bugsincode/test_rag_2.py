import urllib.request, json
from thefuzz import process, fuzz
import sys

sys.stdout.reconfigure(encoding='utf-8')
data = json.loads(urllib.request.urlopen('http://localhost:8000/food').read())
food_names = [f"{f['name_en']} {f.get('name_bn', '')}" for f in data]

print('token_set_ratio:', process.extractOne('biriyani', food_names, scorer=fuzz.token_set_ratio))
print('token_sort_ratio:', process.extractOne('biriyani', food_names, scorer=fuzz.token_sort_ratio))
print('partial_ratio:', process.extractOne('biriyani', food_names, scorer=fuzz.partial_ratio))
print('WRatio:', process.extractOne('biriyani', food_names, scorer=fuzz.WRatio))
