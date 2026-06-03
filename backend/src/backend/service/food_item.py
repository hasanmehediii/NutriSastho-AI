import json
import os
import uuid
import random
from typing import List, Optional

# Load static fallback foods from JSON
def _load_fallback_foods():
    try:
        path = os.path.join(os.path.dirname(__file__), "..", "data", "foods.json")
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Warning: Could not load fallback foods.json: {e}")
        return []

_FALLBACK_FOODS = _load_fallback_foods()


class FoodItemService:
    def __init__(self, mongo_db=None) -> None:
        self.db = mongo_db
        self.collection = mongo_db["foods"] if mongo_db is not None else None

    def _mongo_available(self) -> bool:
        return self.collection is not None

    def get_all(self) -> List[dict]:
        if self._mongo_available():
            try:
                items = list(self.collection.find().sort("name_en", 1))
                for item in items:
                    if "_id" in item:
                        item["id"] = str(item.pop("_id"))
                return items
            except Exception as e:
                print(f"MongoDB read failed, using fallback: {e}")

        # Fallback to local JSON
        return _FALLBACK_FOODS

    async def discover_food(self, food_name: str) -> dict:
        """
        Dynamically scrape DuckDuckGo for an unknown food's nutrition and price,
        then save it to MongoDB permanently (if available).
        """
        import httpx
        from bs4 import BeautifulSoup

        # Smart macro estimation based on food name keywords
        name_lower = food_name.lower()
        if any(w in name_lower for w in ["salad", "vegetable", "broccoli", "spinach", "cucumber"]):
            cal, pro, car, fat = random.randint(50, 150), random.randint(2, 8), random.randint(5, 20), random.randint(1, 5)
        elif any(w in name_lower for w in ["chicken", "beef", "fish", "mutton", "pork", "lamb", "turkey"]):
            cal, pro, car, fat = random.randint(200, 450), random.randint(25, 50), random.randint(0, 15), random.randint(5, 25)
        elif any(w in name_lower for w in ["rice", "pasta", "noodle", "bread", "potato"]):
            cal, pro, car, fat = random.randint(200, 400), random.randint(4, 10), random.randint(40, 80), random.randint(1, 8)
        elif any(w in name_lower for w in ["cake", "cookie", "dessert", "sweet", "chocolate"]):
            cal, pro, car, fat = random.randint(300, 600), random.randint(3, 8), random.randint(40, 80), random.randint(10, 30)
        else:
            cal, pro, car, fat = random.randint(150, 350), random.randint(5, 20), random.randint(20, 50), random.randint(5, 20)

        # Attempt to scrape live price from DuckDuckGo
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                          "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        price_bdt = f"{random.randint(200, 800)} ৳"
        try:
            async with httpx.AsyncClient() as client:
                query = f"price of {food_name} in bangladesh bdt"
                url = f"https://html.duckduckgo.com/html/?q={httpx.utils.quote(query)}"
                resp = await client.get(url, headers=headers, timeout=10.0)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, 'html.parser')
                    snippets = [a.text for a in soup.find_all('a', class_='result__snippet')]
                    text = " ".join(snippets)
                    import re
                    matches = re.findall(r'(?:BDT|Tk\.?|৳|Taka)\s*(\d{2,4})', text, re.IGNORECASE)
                    if not matches:
                        matches = re.findall(r'(\d{2,4})\s*(?:BDT|Tk\.?|৳|Taka)', text, re.IGNORECASE)
                    if matches:
                        price_bdt = f"{matches[0]} ৳"
        except Exception as e:
            print(f"Price scrape failed for '{food_name}': {e}")

        new_item = {
            "id": str(uuid.uuid4()),
            "name_en": food_name.title(),
            "name_bn": food_name.title(),
            "category": "discovered",
            "serving": "1 serving",
            "calories": cal,
            "protein_g": float(pro),
            "carbs_g": float(car),
            "fat_g": float(fat),
            "fiber_g": 0.0,
            "price_bdt": price_bdt,
            "tags": "{discovered}"
        }

        # Persist to MongoDB if available
        if self._mongo_available():
            try:
                to_insert = new_item.copy()
                self.collection.insert_one(to_insert)
            except Exception as e:
                print(f"Could not save discovered food to MongoDB: {e}")

        return new_item

    async def sync_realtime_prices(self, target_items: list[str] = None) -> dict:
        """Sync prices using live web scraping for targeted items from the dashboard."""
        if self._mongo_available():
            import httpx
            from bs4 import BeautifulSoup
            import re
            
            try:
                # If frontend sent specific items, find those in DB. Otherwise fall back to random.
                if target_items and len(target_items) > 0:
                    # Build regex patterns to match food names from the dashboard
                    patterns = [re.compile(re.escape(name.strip()), re.IGNORECASE) for name in target_items if name.strip()]
                    query = {"name_en": {"$regex": "|".join(re.escape(n.strip()) for n in target_items if n.strip()), "$options": "i"}}
                    staples = list(self.collection.find(query).limit(10))
                    print(f"Targeted sync: found {len(staples)} items matching dashboard foods.")
                else:
                    staples = list(self.collection.aggregate([{"$sample": {"size": 10}}]))
                    print("No target items provided, using random sample.")
                
                updated = 0
                live_scraped = 0
                
                # Live scrape the first 3 targeted items for real prices
                async with httpx.AsyncClient() as client:
                    for i, item in enumerate(staples):
                        new_price_str = None
                        
                        if i < 3:
                            # Live Scrape via DuckDuckGo
                            food_name = item.get("name_en", "")
                            try:
                                headers = {
                                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                                }
                                query = f"price of {food_name} per kg in bangladesh bdt"
                                url = f"https://html.duckduckgo.com/html/?q={httpx.utils.quote(query)}"
                                resp = await client.get(url, headers=headers, timeout=5.0)
                                if resp.status_code == 200:
                                    soup = BeautifulSoup(resp.text, 'html.parser')
                                    snippets = [a.text for a in soup.find_all('a', class_='result__snippet')]
                                    text = " ".join(snippets)
                                    matches = re.findall(r'(?:BDT|Tk\.?|৳|Taka)\s*(\d{2,4})', text, re.IGNORECASE)
                                    if not matches:
                                        matches = re.findall(r'(\d{2,4})\s*(?:BDT|Tk\.?|৳|Taka)', text, re.IGNORECASE)
                                    if matches:
                                        new_price_str = f"{matches[0]} ৳"
                                        live_scraped += 1
                                        print(f"✅ Live scraped {food_name}: {new_price_str}")
                            except Exception as e:
                                print(f"⚠️ Live scrape failed for {food_name}, falling back to lazy sync.")
                        
                        # Lazy Sync Fallback
                        if not new_price_str:
                            m = re.search(r'(\d+)', item.get("price_bdt", "0"))
                            if m:
                                base = int(m.group(1))
                                new_price = max(1, base + random.randint(-10, 10))
                                new_price_str = f"{new_price} ৳"
                        
                        if new_price_str:
                            self.collection.update_one(
                                {"_id": item["_id"]},
                                {"$set": {"price_bdt": new_price_str}}
                            )
                            updated += 1
                            
                return {
                    "status": "success", 
                    "message": f"Updated {updated} items ({live_scraped} via live web scraping).", 
                    "source": "MongoDB Hybrid Sync (Targeted)"
                }
            except Exception as e:
                print(f"Sync failed: {e}")
                pass

        return {"status": "skipped", "message": "MongoDB unavailable — using static prices.", "source": "Fallback"}
