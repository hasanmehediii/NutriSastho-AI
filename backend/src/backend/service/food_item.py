from backend.model.FoodItem import FoodItem
from backend.schema.food_item import FoodItemCreate
from sqlalchemy.orm import Session
from sqlalchemy import select

# Hardcoded data from frontend, moved here for auto-seeding
DEFAULT_FOODS = [
  # Rice & Grains
  { "name_en": "White Rice (cooked)", "name_bn": "সাদা ভাত", "category": "rice_grains", "serving": "1 cup (200g)", "calories": 260, "protein_g": 5.4, "carbs_g": 56, "fat_g": 0.6, "fiber_g": 0.6, "price_bdt": "8-10 ৳", "tags": ["staple", "gluten-free"] },
  { "name_en": "Brown Rice (cooked)", "name_bn": "লাল চালের ভাত", "category": "rice_grains", "serving": "1 cup (200g)", "calories": 248, "protein_g": 5.5, "carbs_g": 52, "fat_g": 2.0, "fiber_g": 3.5, "price_bdt": "15-20 ৳", "tags": ["fiber", "diabetes-friendly"] },
  { "name_en": "Roti / Chapati", "name_bn": "রুটি / চাপাতি", "category": "rice_grains", "serving": "1 piece (40g)", "calories": 104, "protein_g": 3.0, "carbs_g": 18, "fat_g": 2.5, "fiber_g": 1.3, "price_bdt": "5-8 ৳", "tags": ["fiber", "diabetes-friendly"] },
  { "name_en": "Paratha", "name_bn": "পরাটা", "category": "rice_grains", "serving": "1 piece (80g)", "calories": 260, "protein_g": 5.0, "carbs_g": 30, "fat_g": 13, "fiber_g": 1.5, "price_bdt": "10-15 ৳", "tags": ["fried", "high-calorie"] },
  { "name_en": "Khichuri", "name_bn": "খিচুড়ি", "category": "rice_grains", "serving": "1 cup (250g)", "calories": 215, "protein_g": 7.0, "carbs_g": 38, "fat_g": 4.5, "fiber_g": 2.5, "price_bdt": "15-20 ৳", "tags": ["comfort-food", "protein"] },
  { "name_en": "Panta Bhat", "name_bn": "পান্তা ভাত", "category": "rice_grains", "serving": "1 cup (250g)", "calories": 180, "protein_g": 3.5, "carbs_g": 40, "fat_g": 0.4, "fiber_g": 1.0, "price_bdt": "5-8 ৳", "tags": ["probiotic", "traditional"] },
  { "name_en": "Chira (Flattened Rice)", "name_bn": "চিঁড়া", "category": "rice_grains", "serving": "1 cup (50g)", "calories": 175, "protein_g": 3.5, "carbs_g": 39, "fat_g": 0.5, "fiber_g": 0.8, "price_bdt": "8-10 ৳", "tags": ["snack", "light"] },
  { "name_en": "Muri (Puffed Rice)", "name_bn": "মুড়ি", "category": "rice_grains", "serving": "1 cup (30g)", "calories": 110, "protein_g": 2.0, "carbs_g": 25, "fat_g": 0.3, "fiber_g": 0.5, "price_bdt": "3-5 ৳", "tags": ["snack", "low-calorie"] },

  # Dal & Pulses
  { "name_en": "Masoor Dal (Red Lentil)", "name_bn": "মসুর ডাল", "category": "dal_pulses", "serving": "1 cup cooked (200g)", "calories": 230, "protein_g": 18.0, "carbs_g": 40, "fat_g": 0.7, "fiber_g": 8.0, "price_bdt": "20-25 ৳", "tags": ["protein", "iron", "budget"] },
  { "name_en": "Mung Dal (Green Gram)", "name_bn": "মুগ ডাল", "category": "dal_pulses", "serving": "1 cup cooked (200g)", "calories": 212, "protein_g": 14.2, "carbs_g": 38, "fat_g": 0.8, "fiber_g": 7.5, "price_bdt": "22-28 ৳", "tags": ["protein", "easy-digest"] },
  { "name_en": "Cholar Dal (Bengal Gram)", "name_bn": "ছোলার ডাল", "category": "dal_pulses", "serving": "1 cup cooked (200g)", "calories": 269, "protein_g": 15.0, "carbs_g": 45, "fat_g": 4.2, "fiber_g": 8.0, "price_bdt": "20-30 ৳", "tags": ["protein", "fiber"] },
  { "name_en": "Motor Dal (Yellow Peas)", "name_bn": "মটর ডাল", "category": "dal_pulses", "serving": "1 cup cooked (200g)", "calories": 231, "protein_g": 16.3, "carbs_g": 41, "fat_g": 1.0, "fiber_g": 8.3, "price_bdt": "18-22 ৳", "tags": ["protein", "budget"] },
  { "name_en": "Chhola (Chickpeas)", "name_bn": "ছোলা (বুট)", "category": "dal_pulses", "serving": "1 cup cooked (160g)", "calories": 269, "protein_g": 14.5, "carbs_g": 45, "fat_g": 4.2, "fiber_g": 12.5, "price_bdt": "25-30 ৳", "tags": ["protein", "fiber", "iron"] },
  { "name_en": "Khesari Dal", "name_bn": "খেসারি ডাল", "category": "dal_pulses", "serving": "1 cup cooked (200g)", "calories": 210, "protein_g": 16.0, "carbs_g": 36, "fat_g": 0.6, "fiber_g": 6.0, "price_bdt": "12-15 ৳", "tags": ["budget", "protein"] },

  # Fish & Meat
  { "name_en": "Hilsha (Ilish) Fish", "name_bn": "ইলিশ মাছ", "category": "fish_meat", "serving": "1 piece (100g)", "calories": 273, "protein_g": 22.0, "carbs_g": 0, "fat_g": 20.0, "fiber_g": 0, "price_bdt": "100-200 ৳", "tags": ["omega-3", "premium"] },
  { "name_en": "Rohu Fish", "name_bn": "রুই মাছ", "category": "fish_meat", "serving": "1 piece (100g)", "calories": 97, "protein_g": 17.0, "carbs_g": 0, "fat_g": 3.0, "fiber_g": 0, "price_bdt": "25-40 ৳", "tags": ["protein", "lean"] },
  { "name_en": "Tilapia Fish", "name_bn": "তেলাপিয়া মাছ", "category": "fish_meat", "serving": "1 piece (100g)", "calories": 96, "protein_g": 20.0, "carbs_g": 0, "fat_g": 1.7, "fiber_g": 0, "price_bdt": "15-25 ৳", "tags": ["protein", "budget", "lean"] },
  { "name_en": "Pangas Fish", "name_bn": "পাঙ্গাশ মাছ", "category": "fish_meat", "serving": "1 piece (100g)", "calories": 90, "protein_g": 15.0, "carbs_g": 0, "fat_g": 3.5, "fiber_g": 0, "price_bdt": "10-18 ৳", "tags": ["budget", "protein"] },
  { "name_en": "Katla Fish", "name_bn": "কাতলা মাছ", "category": "fish_meat", "serving": "1 piece (100g)", "calories": 105, "protein_g": 18.0, "carbs_g": 0, "fat_g": 3.2, "fiber_g": 0, "price_bdt": "30-50 ৳", "tags": ["protein"] },
  { "name_en": "Shutki (Dried Fish)", "name_bn": "শুটকি মাছ", "category": "fish_meat", "serving": "50g", "calories": 160, "protein_g": 32.0, "carbs_g": 0, "fat_g": 3.5, "fiber_g": 0, "price_bdt": "30-60 ৳", "tags": ["protein", "calcium", "shelf-stable"] },
  { "name_en": "Chicken (curry)", "name_bn": "মুরগির মাংস (তরকারি)", "category": "fish_meat", "serving": "1 piece (100g)", "calories": 185, "protein_g": 25.0, "carbs_g": 2, "fat_g": 8.5, "fiber_g": 0, "price_bdt": "25-35 ৳", "tags": ["protein"] },
  { "name_en": "Beef (curry)", "name_bn": "গরুর মাংস (তরকারি)", "category": "fish_meat", "serving": "100g", "calories": 250, "protein_g": 26.0, "carbs_g": 3, "fat_g": 15.0, "fiber_g": 0, "price_bdt": "50-70 ৳", "tags": ["protein", "iron", "high-calorie"] },
  { "name_en": "Egg (boiled)", "name_bn": "ডিম (সেদ্ধ)", "category": "fish_meat", "serving": "1 large (50g)", "calories": 78, "protein_g": 6.3, "carbs_g": 0.6, "fat_g": 5.3, "fiber_g": 0, "price_bdt": "12-15 ৳", "tags": ["protein", "budget"] },
  { "name_en": "Macher Jhol (Fish Curry)", "name_bn": "মাছের ঝোল", "category": "fish_meat", "serving": "1 bowl (250g)", "calories": 180, "protein_g": 18.0, "carbs_g": 8, "fat_g": 9.0, "fiber_g": 1.0, "price_bdt": "30-50 ৳", "tags": ["traditional", "protein"] },

  # Vegetables
  { "name_en": "Potato (aloo)", "name_bn": "আলু", "category": "vegetables", "serving": "1 medium (150g)", "calories": 130, "protein_g": 3.0, "carbs_g": 30, "fat_g": 0.2, "fiber_g": 3.6, "price_bdt": "5-8 ৳", "tags": ["staple", "budget"] },
  { "name_en": "Aloo Bhorta", "name_bn": "আলু ভর্তা", "category": "vegetables", "serving": "1 serving (100g)", "calories": 120, "protein_g": 2.5, "carbs_g": 18, "fat_g": 5.0, "fiber_g": 2.0, "price_bdt": "8-12 ৳", "tags": ["traditional", "comfort-food"] },
  { "name_en": "Begun Bhaji (Eggplant)", "name_bn": "বেগুন ভাজি", "category": "vegetables", "serving": "1 cup (100g)", "calories": 140, "protein_g": 2.0, "carbs_g": 12, "fat_g": 10.0, "fiber_g": 3.0, "price_bdt": "10-15 ৳", "tags": ["fried", "fiber"] },
  { "name_en": "Palong Shak (Spinach)", "name_bn": "পালং শাক", "category": "vegetables", "serving": "1 cup cooked (180g)", "calories": 41, "protein_g": 5.4, "carbs_g": 7, "fat_g": 0.5, "fiber_g": 4.3, "price_bdt": "5-8 ৳", "tags": ["iron", "calcium", "budget"] },
  { "name_en": "Lal Shak (Red Amaranth)", "name_bn": "লাল শাক", "category": "vegetables", "serving": "1 cup cooked (150g)", "calories": 35, "protein_g": 3.5, "carbs_g": 6, "fat_g": 0.4, "fiber_g": 3.0, "price_bdt": "3-5 ৳", "tags": ["iron", "budget", "vitamin-a"] },
  { "name_en": "Pui Shak (Malabar Spinach)", "name_bn": "পুঁই শাক", "category": "vegetables", "serving": "1 cup cooked (150g)", "calories": 30, "protein_g": 3.0, "carbs_g": 5, "fat_g": 0.3, "fiber_g": 2.5, "price_bdt": "3-5 ৳", "tags": ["iron", "budget"] },
  { "name_en": "Misti Kumra (Sweet Pumpkin)", "name_bn": "মিষ্টি কুমড়া", "category": "vegetables", "serving": "1 cup (150g)", "calories": 49, "protein_g": 1.8, "carbs_g": 12, "fat_g": 0.2, "fiber_g": 1.5, "price_bdt": "5-8 ৳", "tags": ["vitamin-a", "fiber"] },
  { "name_en": "Korola (Bitter Gourd)", "name_bn": "করলা", "category": "vegetables", "serving": "1 cup (100g)", "calories": 20, "protein_g": 1.0, "carbs_g": 4, "fat_g": 0.2, "fiber_g": 2.0, "price_bdt": "8-12 ৳", "tags": ["diabetes-friendly", "low-calorie"] },
  { "name_en": "Dheros (Okra/Lady's Finger)", "name_bn": "ঢেঁড়স", "category": "vegetables", "serving": "1 cup (100g)", "calories": 33, "protein_g": 2.0, "carbs_g": 7, "fat_g": 0.2, "fiber_g": 3.2, "price_bdt": "8-12 ৳", "tags": ["fiber", "low-calorie"] },
  { "name_en": "Lau (Bottle Gourd)", "name_bn": "লাউ", "category": "vegetables", "serving": "1 cup (120g)", "calories": 18, "protein_g": 0.7, "carbs_g": 4, "fat_g": 0.1, "fiber_g": 1.2, "price_bdt": "5-8 ৳", "tags": ["low-calorie", "hydrating"] },
  { "name_en": "Potol (Pointed Gourd)", "name_bn": "পটল", "category": "vegetables", "serving": "1 cup (100g)", "calories": 20, "protein_g": 2.0, "carbs_g": 3.5, "fat_g": 0.3, "fiber_g": 1.5, "price_bdt": "8-15 ৳", "tags": ["low-calorie", "diabetes-friendly"] },
  { "name_en": "Data Shak (Stem Amaranth)", "name_bn": "ডাটা শাক", "category": "vegetables", "serving": "1 cup cooked (150g)", "calories": 28, "protein_g": 2.5, "carbs_g": 5, "fat_g": 0.3, "fiber_g": 2.0, "price_bdt": "3-5 ৳", "tags": ["iron", "calcium", "budget"] },

  # Fruits
  { "name_en": "Banana (Kola)", "name_bn": "কলা", "category": "fruits", "serving": "1 medium (120g)", "calories": 105, "protein_g": 1.3, "carbs_g": 27, "fat_g": 0.4, "fiber_g": 3.1, "price_bdt": "5-8 ৳", "tags": ["potassium", "energy"] },
  { "name_en": "Mango (Aam)", "name_bn": "আম", "category": "fruits", "serving": "1 cup (165g)", "calories": 99, "protein_g": 1.4, "carbs_g": 25, "fat_g": 0.6, "fiber_g": 2.6, "price_bdt": "15-30 ৳", "tags": ["vitamin-a", "vitamin-c", "seasonal"] },
  { "name_en": "Jackfruit (Kathal)", "name_bn": "কাঁঠাল", "category": "fruits", "serving": "1 cup (165g)", "calories": 155, "protein_g": 2.8, "carbs_g": 40, "fat_g": 1.0, "fiber_g": 2.5, "price_bdt": "10-20 ৳", "tags": ["energy", "fiber", "seasonal"] },
  { "name_en": "Papaya (Pepe)", "name_bn": "পেঁপে", "category": "fruits", "serving": "1 cup (145g)", "calories": 62, "protein_g": 0.7, "carbs_g": 16, "fat_g": 0.4, "fiber_g": 2.5, "price_bdt": "5-10 ৳", "tags": ["vitamin-c", "digestion"] },
  { "name_en": "Guava (Peyara)", "name_bn": "পেয়ারা", "category": "fruits", "serving": "1 medium (100g)", "calories": 68, "protein_g": 2.6, "carbs_g": 14, "fat_g": 1.0, "fiber_g": 5.4, "price_bdt": "5-10 ৳", "tags": ["vitamin-c", "fiber", "budget"] },
  { "name_en": "Green Coconut Water (Dab)", "name_bn": "ডাবের পানি", "category": "fruits", "serving": "1 coconut (300ml)", "calories": 57, "protein_g": 0.7, "carbs_g": 12, "fat_g": 0.5, "fiber_g": 0, "price_bdt": "30-50 ৳", "tags": ["electrolyte", "hydrating"] },
  { "name_en": "Litchi", "name_bn": "লিচু", "category": "fruits", "serving": "10 pieces (100g)", "calories": 66, "protein_g": 0.8, "carbs_g": 17, "fat_g": 0.4, "fiber_g": 1.3, "price_bdt": "15-30 ৳", "tags": ["vitamin-c", "seasonal"] },
  { "name_en": "Watermelon (Tormuj)", "name_bn": "তরমুজ", "category": "fruits", "serving": "1 cup (150g)", "calories": 46, "protein_g": 0.9, "carbs_g": 12, "fat_g": 0.2, "fiber_g": 0.6, "price_bdt": "5-8 ৳", "tags": ["hydrating", "low-calorie", "seasonal"] },

  # Street Food
  { "name_en": "Fuchka / Panipuri", "name_bn": "ফুচকা", "category": "street_food", "serving": "6 pieces", "calories": 280, "protein_g": 5.0, "carbs_g": 45, "fat_g": 9.0, "fiber_g": 3.0, "price_bdt": "20-30 ৳", "tags": ["high-sodium", "fried"] },
  { "name_en": "Chotpoti", "name_bn": "চটপটি", "category": "street_food", "serving": "1 bowl (200g)", "calories": 310, "protein_g": 8.0, "carbs_g": 48, "fat_g": 10.0, "fiber_g": 5.0, "price_bdt": "25-40 ৳", "tags": ["fiber", "protein", "spicy"] },
  { "name_en": "Jhalmuri", "name_bn": "ঝালমুড়ি", "category": "street_food", "serving": "1 serving (100g)", "calories": 180, "protein_g": 3.5, "carbs_g": 30, "fat_g": 6.0, "fiber_g": 2.0, "price_bdt": "15-20 ৳", "tags": ["snack", "light"] },
  { "name_en": "Singara (Samosa)", "name_bn": "সিঙ্গারা", "category": "street_food", "serving": "2 pieces (100g)", "calories": 290, "protein_g": 4.5, "carbs_g": 30, "fat_g": 17.0, "fiber_g": 2.5, "price_bdt": "10-20 ৳", "tags": ["fried", "high-calorie"] },
  { "name_en": "Pitha (Rice Cake)", "name_bn": "পিঠা", "category": "street_food", "serving": "2 pieces (100g)", "calories": 230, "protein_g": 3.5, "carbs_g": 42, "fat_g": 6.0, "fiber_g": 1.5, "price_bdt": "10-20 ৳", "tags": ["traditional", "seasonal"] },
  { "name_en": "Mughlai Paratha", "name_bn": "মোগলাই পরাটা", "category": "street_food", "serving": "1 piece (200g)", "calories": 520, "protein_g": 16.0, "carbs_g": 45, "fat_g": 30.0, "fiber_g": 2.0, "price_bdt": "40-60 ৳", "tags": ["high-calorie", "fried"] },

  # Sweets & Desserts
  { "name_en": "Mishti Doi (Sweet Yogurt)", "name_bn": "মিষ্টি দই", "category": "sweets", "serving": "1 cup (150g)", "calories": 180, "protein_g": 5.0, "carbs_g": 30, "fat_g": 5.0, "fiber_g": 0, "price_bdt": "20-35 ৳", "tags": ["calcium", "probiotic", "sugar"] },
  { "name_en": "Roshogolla", "name_bn": "রসগোল্লা", "category": "sweets", "serving": "2 pieces (100g)", "calories": 186, "protein_g": 5.0, "carbs_g": 35, "fat_g": 3.5, "fiber_g": 0, "price_bdt": "20-30 ৳", "tags": ["sugar", "calcium"] },
  { "name_en": "Payesh (Rice Pudding)", "name_bn": "পায়েশ", "category": "sweets", "serving": "1 cup (200g)", "calories": 270, "protein_g": 7.0, "carbs_g": 45, "fat_g": 8.0, "fiber_g": 0.5, "price_bdt": "20-30 ৳", "tags": ["calcium", "sugar", "comfort-food"] },
  { "name_en": "Jilapi / Jalebi", "name_bn": "জিলাপি", "category": "sweets", "serving": "3 pieces (100g)", "calories": 380, "protein_g": 2.0, "carbs_g": 60, "fat_g": 15.0, "fiber_g": 0, "price_bdt": "20-30 ৳", "tags": ["sugar", "fried", "high-calorie"] },
  { "name_en": "Shandesh", "name_bn": "সন্দেশ", "category": "sweets", "serving": "2 pieces (80g)", "calories": 200, "protein_g": 6.0, "carbs_g": 30, "fat_g": 7.0, "fiber_g": 0, "price_bdt": "25-40 ৳", "tags": ["calcium", "sugar"] },

  # Beverages
  { "name_en": "Cha (Tea with milk)", "name_bn": "চা (দুধ চা)", "category": "beverages", "serving": "1 cup (150ml)", "calories": 60, "protein_g": 1.5, "carbs_g": 10, "fat_g": 1.5, "fiber_g": 0, "price_bdt": "5-10 ৳", "tags": ["caffeine"] },
  { "name_en": "Lassi (Sweet yogurt drink)", "name_bn": "লাচ্ছি", "category": "beverages", "serving": "1 glass (250ml)", "calories": 165, "protein_g": 6.0, "carbs_g": 28, "fat_g": 3.5, "fiber_g": 0, "price_bdt": "20-35 ৳", "tags": ["calcium", "probiotic"] },
  { "name_en": "Borhani", "name_bn": "বোরহানী", "category": "beverages", "serving": "1 glass (250ml)", "calories": 80, "protein_g": 3.0, "carbs_g": 12, "fat_g": 2.0, "fiber_g": 0, "price_bdt": "15-25 ৳", "tags": ["probiotic", "digestive"] },
  { "name_en": "Sugarcane Juice (Akhher Rosh)", "name_bn": "আখের রস", "category": "beverages", "serving": "1 glass (250ml)", "calories": 180, "protein_g": 0.3, "carbs_g": 45, "fat_g": 0, "fiber_g": 0, "price_bdt": "15-25 ৳", "tags": ["energy", "sugar"] },
  { "name_en": "Lemon Water (Lebur Shorbot)", "name_bn": "লেবুর শরবত", "category": "beverages", "serving": "1 glass (250ml)", "calories": 45, "protein_g": 0.2, "carbs_g": 12, "fat_g": 0, "fiber_g": 0, "price_bdt": "5-10 ৳", "tags": ["vitamin-c", "hydrating", "budget"] }
]

class FoodItemService:
    def __init__(self, session: Session) -> None:
        self.session = session

    def seed_data_if_empty(self) -> None:
        count = self.session.query(FoodItem).count()
        if count == 0:
            print("Seeding food database...")
            for f in DEFAULT_FOODS:
                item = FoodItem(**f)
                self.session.add(item)
            self.session.commit()

    def get_all(self) -> list[FoodItem]:
        # Ensure data exists
        self.seed_data_if_empty()
        
        stmt = select(FoodItem).order_by(FoodItem.name_en)
        return list(self.session.execute(stmt).scalars().all())
