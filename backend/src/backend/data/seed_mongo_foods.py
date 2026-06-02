import sys, os, random, uuid, json
from pymongo import MongoClient
from dotenv import load_dotenv

# Load env
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', '.env'), override=False)
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '..', '.env'), override=False)

MONGO_URI = os.getenv("MONGO_URI", "")
if not MONGO_URI:
    raise ValueError("MONGO_URI not found in .env")

client = MongoClient(MONGO_URI, tlsAllowInvalidCertificates=True)
mongo_db = client["NutriSastho"]


def load_default_foods():
    try:
        path = os.path.join(os.path.dirname(__file__), "foods.json")
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading foods.json: {e}")
        return []

# Base foods from existing json
bangladeshi_foods = load_default_foods()

# Generate procedural foods to hit 1500
proteins = ["Chicken", "Beef", "Mutton", "Pork", "Tofu", "Paneer", "Fish", "Shrimp", "Duck", "Lamb", "Turkey", "Salmon", "Tuna", "Soya", "Egg", "Crab", "Squid"]
carbs = ["Rice", "Noodles", "Pasta", "Bread", "Potato", "Sweet Potato", "Quinoa", "Oats", "Couscous", "Tortilla", "Wrap", "Bagel", "Bun"]
veggies = ["Broccoli", "Spinach", "Carrot", "Cabbage", "Mushroom", "Zucchini", "Bell Pepper", "Onion", "Tomato", "Cauliflower", "Eggplant", "Peas"]
methods = ["Grilled", "Fried", "Baked", "Roasted", "Steamed", "Boiled", "Stir-fried", "Smoked", "Curried", "Raw", "Mashed", "Stuffed", "Spicy", "Sweet & Sour", "BBQ"]
styles = ["Italian", "Mexican", "Chinese", "Thai", "Indian", "Mediterranean", "Korean", "Japanese", "Vietnamese", "Greek", "Lebanese"]

generated_foods = []

for _ in range(1500 - len(bangladeshi_foods)):
    # Pick a random structure
    struct_type = random.choice(["protein_carb", "protein_veg", "carb_veg", "protein_method_style"])
    
    if struct_type == "protein_carb":
        name = f"{random.choice(methods)} {random.choice(proteins)} with {random.choice(carbs)}"
        category = "main_course"
        cal = random.randint(300, 700)
        pro = random.randint(15, 45)
        car = random.randint(30, 80)
        fat = random.randint(10, 35)
    elif struct_type == "protein_veg":
        name = f"{random.choice(methods)} {random.choice(proteins)} and {random.choice(veggies)}"
        category = "main_course"
        cal = random.randint(200, 500)
        pro = random.randint(15, 40)
        car = random.randint(10, 30)
        fat = random.randint(5, 25)
    elif struct_type == "carb_veg":
        name = f"{random.choice(styles)} Style {random.choice(veggies)} {random.choice(carbs)}"
        category = "vegetarian"
        cal = random.randint(250, 600)
        pro = random.randint(5, 15)
        car = random.randint(40, 90)
        fat = random.randint(5, 20)
    else:
        name = f"{random.choice(styles)} {random.choice(methods)} {random.choice(proteins)}"
        category = "main_course"
        cal = random.randint(300, 600)
        pro = random.randint(20, 50)
        car = random.randint(5, 20)
        fat = random.randint(15, 30)
        
    price = random.randint(150, 800)
    
    # Avoid exact duplicates
    while any(f['name_en'] == name for f in generated_foods):
        name += " (Extra)"
        
    generated_foods.append({
        "id": str(uuid.uuid4()),
        "name_en": name,
        "name_bn": name, # Simplification
        "category": category,
        "serving": "1 serving",
        "calories": cal,
        "protein_g": float(pro),
        "carbs_g": float(car),
        "fat_g": float(fat),
        "fiber_g": float(random.randint(0, 10)),
        "price_bdt": f"{price} ৳",
        "tags": f"{{{category}}}"
    })

all_foods = bangladeshi_foods + generated_foods

print(f"Total foods to insert: {len(all_foods)}")

collection = mongo_db["foods"]

# Drop existing to avoid duplicates if re-run
collection.drop()

result = collection.insert_many(all_foods)
print(f"Successfully inserted {len(result.inserted_ids)} items into MongoDB.")
