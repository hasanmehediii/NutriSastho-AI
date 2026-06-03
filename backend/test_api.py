import urllib.request, json, sys
sys.stdout.reconfigure(encoding='utf-8')
data = json.loads(urllib.request.urlopen('http://localhost:8000/food').read())
print(f'API /food returned: {len(data)} items')
for f in data[:5]:
    print(f"  - {f.get('name_en')} | {f.get('calories')} cal | {f.get('price_bdt')}")
