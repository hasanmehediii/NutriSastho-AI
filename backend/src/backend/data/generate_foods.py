import json

def generate_foods():
    foods = []
    
    # RICE & GRAINS (30)
    grains = [
        ("White Rice", "সাদা ভাত", 260, 5.4, 56, 0.6, 0.6, "8-10 ৳", "staple"),
        ("Brown Rice", "লাল চালের ভাত", 248, 5.5, 52, 2.0, 3.5, "15-20 ৳", "fiber"),
        ("Miniket Rice", "মিনিকেট চালের ভাত", 250, 5.0, 55, 0.5, 0.5, "10-12 ৳", "staple"),
        ("Nazirshail Rice", "নাজিরশাইল চালের ভাত", 255, 5.2, 56, 0.6, 0.6, "12-15 ৳", "staple"),
        ("Basmati Rice", "বাসমতি চালের ভাত", 210, 4.4, 45, 0.5, 0.8, "20-30 ৳", "premium"),
        ("Polao", "পোলাও", 350, 6.0, 45, 15.0, 1.0, "30-50 ৳", "festive"),
        ("Biryani (Chicken)", "চিকেন বিরিয়ানি", 450, 20.0, 50, 18.0, 2.0, "150-200 ৳", "festive"),
        ("Biryani (Beef)", "বিফ বিরিয়ানি", 550, 25.0, 45, 25.0, 2.0, "180-250 ৳", "festive"),
        ("Biryani (Mutton)", "মাটন বিরিয়ানি", 580, 22.0, 45, 28.0, 2.0, "200-300 ৳", "festive"),
        ("Tehari (Beef)", "বিফ তেহারি", 480, 20.0, 48, 22.0, 1.5, "120-180 ৳", "traditional"),
        ("Khichuri (Plain)", "খুদে খিচুড়ি", 215, 7.0, 38, 4.5, 2.5, "15-20 ৳", "comfort-food"),
        ("Khichuri (Bhuna)", "ভুনা খিচুড়ি", 320, 9.0, 42, 12.0, 3.0, "40-60 ৳", "rich"),
        ("Panta Bhat", "পান্তা ভাত", 180, 3.5, 40, 0.4, 1.0, "5-8 ৳", "traditional"),
        ("Roti / Chapati", "রুটি / চাপাতি", 104, 3.0, 18, 2.5, 1.3, "5-8 ৳", "fiber"),
        ("Naan Bread", "নান রুটি", 260, 8.0, 42, 6.0, 2.0, "20-40 ৳", "restaurant"),
        ("Garlic Naan", "গার্লিক নান", 280, 8.5, 43, 8.0, 2.0, "30-50 ৳", "restaurant"),
        ("Paratha", "পরাটা", 260, 5.0, 30, 13.0, 1.5, "10-15 ৳", "fried"),
        ("Luchi", "লুচি", 150, 3.0, 15, 8.0, 0.5, "5-10 ৳", "fried"),
        ("Pauruti (Bread)", "পাউরুটি", 150, 5.0, 28, 1.5, 1.5, "5-10 ৳", "breakfast"), # ADDED BREAD!
        ("Brown Bread", "লাল পাউরুটি", 140, 6.0, 25, 1.5, 4.0, "8-12 ৳", "breakfast"),
        ("Bun (Ruti)", "বন রুটি", 180, 4.0, 32, 4.0, 1.0, "10-15 ৳", "snack"),
        ("Chira (Flattened Rice)", "চিঁড়া", 175, 3.5, 39, 0.5, 0.8, "8-10 ৳", "snack"),
        ("Muri (Puffed Rice)", "মুড়ি", 110, 2.0, 25, 0.3, 0.5, "3-5 ৳", "snack"),
        ("Khoi (Popped Rice)", "খৈ", 100, 2.2, 22, 0.2, 0.6, "5-8 ৳", "snack"),
        ("Oats (cooked)", "ওটস", 150, 5.0, 27, 2.5, 4.0, "20-30 ৳", "healthy"),
        ("Noodles (Instant)", "নুডলস", 380, 8.0, 55, 14.0, 2.0, "15-25 ৳", "fast-food"),
        ("Pasta (cooked)", "পাস্তা", 220, 8.0, 43, 1.3, 2.5, "40-80 ৳", "western"),
        ("Semai (Vermicelli)", "সেমাই", 210, 4.0, 45, 1.0, 1.5, "15-25 ৳", "dessert-base"),
        ("Suji (Semolina)", "সুজি", 180, 5.0, 36, 0.5, 1.0, "10-15 ৳", "dessert-base"),
        ("Atta (Wheat Flour)", "আটা", 340, 12.0, 72, 1.7, 10.0, "40-50 ৳", "ingredient"),
    ]
    for g in grains:
        foods.append({ "name_en": g[0], "name_bn": g[1], "category": "rice_grains", "serving": "1 serving", "calories": g[2], "protein_g": g[3], "carbs_g": g[4], "fat_g": g[5], "fiber_g": g[6], "price_bdt": g[7], "tags": [g[8]] })

    # DAL & PULSES (15)
    pulses = [
        ("Masoor Dal", "মসুর ডাল", 230, 18.0, 40, 0.7, 8.0, "20-25 ৳", "protein"),
        ("Mung Dal", "মুগ ডাল", 212, 14.2, 38, 0.8, 7.5, "22-28 ৳", "protein"),
        ("Cholar Dal", "ছোলার ডাল", 269, 15.0, 45, 4.2, 8.0, "20-30 ৳", "protein"),
        ("Motor Dal", "মটর ডাল", 231, 16.3, 41, 1.0, 8.3, "18-22 ৳", "protein"),
        ("Chhola (Chickpeas)", "ছোলা", 269, 14.5, 45, 4.2, 12.5, "25-30 ৳", "protein"),
        ("Khesari Dal", "খেসারি ডাল", 210, 16.0, 36, 0.6, 6.0, "12-15 ৳", "budget"),
        ("Mashkalai Dal", "মাষকলাই ডাল", 220, 16.5, 38, 1.2, 7.0, "25-35 ৳", "traditional"),
        ("Arhar Dal", "অড়হর ডাল", 215, 15.5, 39, 1.0, 7.5, "25-30 ৳", "protein"),
        ("Rajma (Kidney Beans)", "রাজমা", 225, 15.0, 40, 0.8, 11.0, "30-40 ৳", "fiber"),
        ("Dabli (Yellow Peas)", "ডাবলি", 220, 14.0, 40, 1.0, 8.0, "15-20 ৳", "street-food-base"),
        ("Peanut (Badam)", "চিনাবাদাম", 567, 25.8, 16, 49.2, 8.5, "10-20 ৳", "snack"),
        ("Cashew Nut", "কাজুবাদাম", 553, 18.2, 30, 43.8, 3.3, "100-150 ৳", "premium-snack"),
        ("Almond", "কাঠবাদাম", 579, 21.1, 21, 49.9, 12.5, "150-200 ৳", "premium-snack"),
        ("Pistachio", "পেস্তাবাদাম", 562, 20.2, 27, 45.3, 10.6, "200-250 ৳", "premium-snack"),
        ("Walnut", "আখরোট", 654, 15.2, 13, 65.2, 6.7, "250-300 ৳", "premium-snack"),
    ]
    for p in pulses:
        foods.append({ "name_en": p[0], "name_bn": p[1], "category": "dal_pulses", "serving": "1 serving", "calories": p[2], "protein_g": p[3], "carbs_g": p[4], "fat_g": p[5], "fiber_g": p[6], "price_bdt": p[7], "tags": [p[8]] })

    # FISH & MEAT (60)
    meats = [
        ("Hilsha (Ilish)", "ইলিশ", 273, 22.0, 0, 20.0, 0, "150-300 ৳", "omega-3"),
        ("Rohu (Rui)", "রুই", 97, 17.0, 0, 3.0, 0, "40-60 ৳", "protein"),
        ("Katla", "কাতলা", 105, 18.0, 0, 3.2, 0, "45-65 ৳", "protein"),
        ("Mrigal", "মৃগেল", 95, 17.5, 0, 2.5, 0, "35-50 ৳", "protein"),
        ("Tilapia", "তেলাপিয়া", 96, 20.0, 0, 1.7, 0, "20-30 ৳", "budget"),
        ("Pangas", "পাঙ্গাশ", 90, 15.0, 0, 3.5, 0, "15-25 ৳", "budget"),
        ("Koi", "কৈ", 110, 16.0, 0, 4.5, 0, "50-80 ৳", "traditional"),
        ("Magur", "মাগুর", 105, 15.5, 0, 4.0, 0, "60-90 ৳", "traditional"),
        ("Shing", "শিং", 95, 16.5, 0, 2.8, 0, "70-100 ৳", "healthy"),
        ("Tengra", "টেংরা", 115, 14.0, 0, 6.0, 0, "40-70 ৳", "tasty"),
        ("Puti", "পুঁটি", 120, 15.0, 0, 6.5, 0, "20-40 ৳", "budget"),
        ("Mola", "মলা", 100, 14.5, 0, 4.5, 0, "30-50 ৳", "calcium"),
        ("Kachki", "কাচকি", 95, 15.0, 0, 3.5, 0, "30-50 ৳", "calcium"),
        ("Boal", "বোয়াল", 125, 16.0, 0, 6.5, 0, "60-100 ৳", "premium"),
        ("Aair", "আইড়", 110, 17.0, 0, 4.2, 0, "70-120 ৳", "premium"),
        ("Chital", "চিতল", 130, 18.0, 0, 5.5, 0, "80-150 ৳", "premium"),
        ("Pabda", "পাবদা", 105, 16.5, 0, 4.0, 0, "60-100 ৳", "tasty"),
        ("Bhetki / Koral", "ভেটকি", 115, 19.0, 0, 3.8, 0, "80-150 ৳", "premium"),
        ("Rupchanda", "রূপচাঁদা", 140, 17.5, 0, 7.5, 0, "100-200 ৳", "sea-fish"),
        ("Loitta", "লইট্যা", 85, 14.0, 0, 2.5, 0, "20-40 ৳", "sea-fish"),
        ("Koral", "কোরাল", 120, 18.5, 0, 4.5, 0, "90-160 ৳", "sea-fish"),
        ("Tuna", "টুনা", 130, 28.0, 0, 1.0, 0, "100-200 ৳", "sea-fish"),
        ("Shrimp (Chingri)", "চিংড়ি", 99, 24.0, 0.2, 0.3, 0, "60-150 ৳", "seafood"),
        ("Prawn (Golda)", "গলদা চিংড়ি", 110, 22.0, 0, 1.5, 0, "150-300 ৳", "seafood"),
        ("Crab", "কাঁকড়া", 85, 18.0, 0, 1.2, 0, "80-150 ৳", "seafood"),
        ("Shutki (Loitta)", "লইট্যা শুটকি", 160, 32.0, 0, 3.5, 0, "30-60 ৳", "dried-fish"),
        ("Shutki (Chepa)", "চ্যাপা শুটকি", 170, 30.0, 0, 4.5, 0, "40-70 ৳", "dried-fish"),
        ("Chicken (Broiler)", "ব্রয়লার মুরগি", 165, 31.0, 0, 3.6, 0, "20-30 ৳", "lean"),
        ("Chicken (Deshi)", "দেশি মুরগি", 185, 28.0, 0, 7.0, 0, "50-80 ৳", "protein"),
        ("Chicken Breast", "মুরগির বুকের মাংস", 120, 26.0, 0, 1.5, 0, "30-50 ৳", "lean-protein"),
        ("Chicken Curry", "মুরগির তরকারি", 185, 25.0, 2, 8.5, 0, "40-60 ৳", "traditional"),
        ("Beef (curry)", "গরুর মাংসের তরকারি", 250, 26.0, 3, 15.0, 0, "70-100 ৳", "traditional"),
        ("Beef (Kala Bhuna)", "গরুর কালা ভুনা", 320, 28.0, 5, 22.0, 0, "100-150 ৳", "traditional"),
        ("Mutton (curry)", "খাসির মাংস", 295, 25.0, 0, 21.0, 0, "100-150 ৳", "traditional"),
        ("Mutton (Rezala)", "খাসির রেজালা", 340, 22.0, 8, 25.0, 0, "150-200 ৳", "traditional"),
        ("Duck (curry)", "হাঁসের মাংস", 337, 19.0, 0, 28.0, 0, "80-120 ৳", "traditional"),
        ("Pigeon", "কবুতর", 142, 17.5, 0, 7.5, 0, "60-100 ৳", "protein"),
        ("Egg (Chicken)", "মুরগির ডিম", 78, 6.3, 0.6, 5.3, 0, "12-15 ৳", "budget"),
        ("Egg (Duck)", "হাঁসের ডিম", 130, 9.0, 1.0, 9.6, 0, "15-20 ৳", "rich"),
        ("Egg (Quail)", "কোয়েলের ডিম", 14, 1.2, 0.1, 1.0, 0, "3-5 ৳", "snack"),
        ("Omelet", "ডিম ভাজি / অমলেট", 154, 11.0, 1.0, 12.0, 0, "15-20 ৳", "breakfast"),
        ("Poached Egg", "ডিম পোচ", 72, 6.0, 0.4, 4.8, 0, "15-20 ৳", "breakfast"),
    ]
    for m in meats:
        foods.append({ "name_en": m[0], "name_bn": m[1], "category": "fish_meat", "serving": "1 serving", "calories": m[2], "protein_g": m[3], "carbs_g": m[4], "fat_g": m[5], "fiber_g": m[6], "price_bdt": m[7], "tags": [m[8]] })

    # VEGETABLES (50)
    veggies = [
        ("Potato", "আলু", 130, 3.0, 30, 0.2, 3.6, "5-8 ৳", "staple"),
        ("Aloo Bhorta", "আলু ভর্তা", 120, 2.5, 18, 5.0, 2.0, "8-12 ৳", "traditional"),
        ("Eggplant (Begun)", "বেগুন", 25, 1.0, 6, 0.2, 3.0, "5-10 ৳", "fiber"),
        ("Begun Bhorta", "বেগুন ভর্তা", 90, 1.5, 8, 6.0, 3.0, "10-15 ৳", "traditional"),
        ("Begun Bhaji", "বেগুন ভাজি", 140, 2.0, 12, 10.0, 3.0, "10-15 ৳", "fried"),
        ("Tomato", "টমেটো", 18, 0.9, 3.9, 0.2, 1.2, "3-6 ৳", "vitamin-c"),
        ("Onion", "পেঁয়াজ", 40, 1.1, 9.3, 0.1, 1.7, "5-10 ৳", "base"),
        ("Garlic", "রসুন", 149, 6.4, 33, 0.5, 2.1, "15-25 ৳", "base"),
        ("Ginger", "আদা", 80, 1.8, 18, 0.7, 2.0, "10-20 ৳", "base"),
        ("Green Chili", "কাঁচা মরিচ", 40, 2.0, 9.0, 0.2, 1.5, "2-5 ৳", "spice"),
        ("Cabbage (Badhakopi)", "বাঁধাকপি", 25, 1.3, 5.8, 0.1, 2.5, "10-20 ৳", "fiber"),
        ("Cauliflower (Fulkopi)", "ফুলকপি", 25, 1.9, 5.0, 0.3, 2.0, "15-25 ৳", "fiber"),
        ("Carrot (Gajor)", "গাজর", 41, 0.9, 9.6, 0.2, 2.8, "10-15 ৳", "vitamin-a"),
        ("Radish (Mula)", "মুলা", 16, 0.7, 3.4, 0.1, 1.6, "5-10 ৳", "low-calorie"),
        ("Pumpkin (Misti Kumra)", "মিষ্টি কুমড়া", 26, 1.0, 6.5, 0.1, 0.5, "10-15 ৳", "vitamin-a"),
        ("Bottle Gourd (Lau)", "লাউ", 14, 0.6, 3.4, 0.1, 0.5, "15-25 ৳", "hydrating"),
        ("Ash Gourd (Chal Kumra)", "চাল কুমড়া", 13, 0.4, 3.0, 0.2, 2.9, "15-25 ৳", "hydrating"),
        ("Pointed Gourd (Potol)", "পটল", 20, 2.0, 3.5, 0.3, 1.5, "10-15 ৳", "healthy"),
        ("Ridge Gourd (Jhinga)", "ঝিঙ্গা", 15, 0.5, 3.3, 0.1, 1.2, "10-15 ৳", "healthy"),
        ("Sponge Gourd (Dhundul)", "ধুনদুল", 18, 1.0, 3.5, 0.2, 1.5, "10-15 ৳", "healthy"),
        ("Snake Gourd (Chichinga)", "চিচিঙ্গা", 18, 0.8, 3.8, 0.2, 1.2, "10-15 ৳", "healthy"),
        ("Bitter Gourd (Korola)", "করলা", 17, 1.0, 3.7, 0.2, 2.8, "10-15 ৳", "diabetes-friendly"),
        ("Okra (Dheros)", "ঢেঁড়স", 33, 2.0, 7.5, 0.2, 3.2, "10-15 ৳", "fiber"),
        ("Cucumber (Shosha)", "শসা", 15, 0.6, 3.6, 0.1, 0.5, "5-10 ৳", "hydrating"),
        ("Papaya Green (Kacha Pepe)", "কাঁচা পেঁপে", 43, 1.5, 10.0, 0.1, 1.7, "10-15 ৳", "digestion"),
        ("Plantain (Kacha Kola)", "কাঁচা কলা", 89, 1.3, 23.0, 0.3, 2.3, "5-10 ৳", "iron"),
        ("Taro Root (Kochur Mukhi)", "কচুর মুখি", 142, 1.5, 34.6, 0.1, 4.1, "10-15 ৳", "fiber"),
        ("Taro Lobe (Kochur Loti)", "কচুর লতি", 60, 2.0, 13.0, 0.2, 3.0, "10-15 ৳", "iron"),
        ("Spinach (Palong Shak)", "পালং শাক", 23, 2.9, 3.6, 0.4, 2.2, "5-10 ৳", "iron"),
        ("Red Amaranth (Lal Shak)", "লাল শাক", 23, 2.5, 4.0, 0.1, 1.5, "5-10 ৳", "iron"),
        ("Malabar Spinach (Pui Shak)", "পুঁই শাক", 20, 2.0, 3.5, 0.1, 1.5, "5-10 ৳", "fiber"),
        ("Stem Amaranth (Data Shak)", "ডাটা শাক", 25, 2.2, 4.5, 0.2, 1.8, "5-10 ৳", "fiber"),
        ("Water Spinach (Kolmi Shak)", "কলমি শাক", 19, 2.6, 3.1, 0.2, 2.1, "5-10 ৳", "healthy"),
        ("Jute Leaves (Pat Shak)", "পাট শাক", 40, 4.5, 6.0, 0.5, 2.0, "5-10 ৳", "traditional"),
        ("Bottle Gourd Leaves (Lau Shak)", "লাউ শাক", 25, 3.0, 4.0, 0.2, 2.5, "5-10 ৳", "fiber"),
        ("Coriander Leaves (Dhone Pata)", "ধনে পাতা", 23, 2.1, 3.7, 0.5, 2.8, "2-5 ৳", "herb"),
    ]
    for v in veggies:
        foods.append({ "name_en": v[0], "name_bn": v[1], "category": "vegetables", "serving": "1 serving", "calories": v[2], "protein_g": v[3], "carbs_g": v[4], "fat_g": v[5], "fiber_g": v[6], "price_bdt": v[7], "tags": [v[8]] })

    # FRUITS (25)
    fruits = [
        ("Banana (Kola)", "কলা", 105, 1.3, 27, 0.4, 3.1, "5-8 ৳", "potassium"),
        ("Mango (Aam)", "আম", 99, 1.4, 25, 0.6, 2.6, "15-30 ৳", "vitamin-a"),
        ("Jackfruit (Kathal)", "কাঁঠাল", 155, 2.8, 40, 1.0, 2.5, "10-20 ৳", "energy"),
        ("Papaya (Ripe)", "পাকা পেঁপে", 62, 0.7, 16, 0.4, 2.5, "10-20 ৳", "digestion"),
        ("Guava (Peyara)", "পেয়ারা", 68, 2.6, 14, 1.0, 5.4, "5-10 ৳", "vitamin-c"),
        ("Green Coconut Water (Dab)", "ডাবের পানি", 57, 0.7, 12, 0.5, 0, "30-50 ৳", "electrolyte"),
        ("Litchi", "লিচু", 66, 0.8, 17, 0.4, 1.3, "15-30 ৳", "vitamin-c"),
        ("Watermelon (Tormuj)", "তরমুজ", 46, 0.9, 12, 0.2, 0.6, "5-8 ৳", "hydrating"),
        ("Pineapple (Anarosh)", "আনারস", 82, 0.9, 22, 0.2, 2.3, "15-25 ৳", "vitamin-c"),
        ("Orange (Komola)", "কমলা", 62, 1.2, 15, 0.2, 3.1, "15-25 ৳", "vitamin-c"),
        ("Malta", "মাল্টা", 60, 1.0, 14, 0.2, 2.5, "15-25 ৳", "vitamin-c"),
        ("Apple", "আপেল", 95, 0.5, 25, 0.3, 4.4, "20-30 ৳", "fiber"),
        ("Pomegranate (Dalim)", "ডালিম", 144, 2.0, 33, 1.5, 7.0, "30-50 ৳", "iron"),
        ("Grapes (Angur)", "আঙ্গুর", 104, 1.1, 27, 0.2, 1.4, "20-40 ৳", "antioxidant"),
        ("Date (Khejur)", "খেজুর", 282, 2.5, 75, 0.4, 8.0, "10-20 ৳", "energy"),
        ("Plum (Boroi)", "বরই", 46, 0.7, 11, 0.3, 1.4, "5-10 ৳", "vitamin-c"),
        ("Hog Plum (Amra)", "আমড়া", 45, 1.0, 10, 0.2, 2.0, "5-10 ৳", "vitamin-c"),
        ("Star Apple (Jamrul)", "জামরুল", 25, 0.5, 6, 0.1, 1.0, "5-10 ৳", "hydrating"),
        ("Blackberry (Jaam)", "কালো জাম", 60, 1.0, 14, 0.2, 1.5, "10-20 ৳", "iron"),
        ("Bael (Wood Apple)", "বেল", 137, 1.8, 32, 0.3, 2.9, "15-25 ৳", "digestion"),
    ]
    for f in fruits:
        foods.append({ "name_en": f[0], "name_bn": f[1], "category": "fruits", "serving": "1 serving", "calories": f[2], "protein_g": f[3], "carbs_g": f[4], "fat_g": f[5], "fiber_g": f[6], "price_bdt": f[7], "tags": [f[8]] })

    # STREET FOOD & SNACKS (30)
    snacks = [
        ("Fuchka", "ফুচকা", 280, 5.0, 45, 9.0, 3.0, "30-50 ৳", "high-sodium"),
        ("Chotpoti", "চটপটি", 310, 8.0, 48, 10.0, 5.0, "40-60 ৳", "fiber"),
        ("Jhalmuri", "ঝালমুড়ি", 180, 3.5, 30, 6.0, 2.0, "15-25 ৳", "snack"),
        ("Singara", "সিঙ্গারা", 290, 4.5, 30, 17.0, 2.5, "10-15 ৳", "fried"),
        ("Samosa", "সমুচা", 260, 5.0, 28, 15.0, 2.0, "10-15 ৳", "fried"),
        ("Peyaju", "পেঁয়াজু", 180, 5.0, 18, 10.0, 2.0, "5-10 ৳", "fried"),
        ("Beguni", "বেগুনি", 150, 2.0, 15, 9.0, 1.5, "5-10 ৳", "fried"),
        ("Alur Chop", "আলুর চপ", 200, 3.0, 20, 12.0, 2.0, "5-10 ৳", "fried"),
        ("Mughlai Paratha", "মোগলাই পরাটা", 520, 16.0, 45, 30.0, 2.0, "50-80 ৳", "high-calorie"),
        ("Haleem", "হালিম", 350, 20.0, 35, 15.0, 4.0, "60-100 ৳", "rich"),
        ("Chicken Roll", "চিকেন রোল", 300, 12.0, 30, 15.0, 1.5, "30-50 ৳", "snack"),
        ("Vegetable Roll", "সবজি রোল", 220, 5.0, 35, 8.0, 3.0, "20-30 ৳", "snack"),
        ("Burger (Beef)", "বিফ বার্গার", 450, 20.0, 40, 22.0, 2.0, "80-150 ৳", "fast-food"),
        ("Burger (Chicken)", "চিকেন বার্গার", 400, 18.0, 40, 18.0, 2.0, "70-130 ৳", "fast-food"),
        ("Pizza (Slice)", "পিৎজা", 285, 12.0, 35, 10.0, 2.5, "80-150 ৳", "fast-food"),
        ("Biscuit (Toast)", "টোস্ট বিস্কুট", 120, 2.0, 20, 3.0, 0.5, "5-10 ৳", "snack"), # BISCUITS
        ("Biscuit (Sweet)", "মিষ্টি বিস্কুট", 150, 2.0, 22, 6.0, 0.5, "5-10 ৳", "snack"),
        ("Chanachur", "চানাচুর", 250, 6.0, 20, 16.0, 3.0, "10-20 ৳", "snack"),
        ("Bakharkhani", "বখরখানি", 300, 5.0, 40, 14.0, 1.0, "10-20 ৳", "traditional"),
        ("Pitha (Bhapa)", "ভাপা পিঠা", 180, 2.5, 35, 3.0, 1.0, "10-20 ৳", "traditional"),
        ("Pitha (Chitoi)", "চিতই পিঠা", 150, 3.0, 32, 1.0, 1.5, "10-15 ৳", "traditional"),
        ("Pitha (Puli)", "পুলি পিঠা", 220, 3.5, 38, 5.0, 1.5, "15-25 ৳", "traditional"),
    ]
    for s in snacks:
        foods.append({ "name_en": s[0], "name_bn": s[1], "category": "street_food", "serving": "1 serving", "calories": s[2], "protein_g": s[3], "carbs_g": s[4], "fat_g": s[5], "fiber_g": s[6], "price_bdt": s[7], "tags": [s[8]] })

    # SWEETS (15)
    sweets = [
        ("Mishti Doi", "মিষ্টি দই", 180, 5.0, 30, 5.0, 0, "30-50 ৳", "probiotic"),
        ("Roshogolla", "রসগোল্লা", 186, 5.0, 35, 3.5, 0, "20-30 ৳", "sugar"),
        ("Golab Jamun", "গোলাপ জাম", 220, 4.0, 40, 5.0, 0, "20-30 ৳", "sugar"),
        ("Kalo Jam", "কালো জাম", 250, 4.5, 45, 6.0, 0, "20-30 ৳", "sugar"),
        ("Shandesh", "সন্দেশ", 200, 6.0, 30, 7.0, 0, "25-40 ৳", "calcium"),
        ("Chamcham", "চমচম", 210, 5.0, 38, 4.0, 0, "25-40 ৳", "sugar"),
        ("Payesh", "পায়েশ", 270, 7.0, 45, 8.0, 0.5, "30-50 ৳", "comfort-food"),
        ("Jilapi", "জিলাপি", 380, 2.0, 60, 15.0, 0, "20-30 ৳", "sugar"),
        ("Firni", "ফিরনি", 250, 6.0, 40, 7.0, 0.5, "30-50 ৳", "comfort-food"),
        ("Falooda", "ফালুদা", 320, 8.0, 55, 8.0, 2.0, "80-150 ৳", "dessert"),
        ("Ice Cream", "আইসক্রিম", 207, 3.5, 24, 11.0, 0, "30-80 ৳", "sugar"),
    ]
    for sw in sweets:
        foods.append({ "name_en": sw[0], "name_bn": sw[1], "category": "sweets", "serving": "1 serving", "calories": sw[2], "protein_g": sw[3], "carbs_g": sw[4], "fat_g": sw[5], "fiber_g": sw[6], "price_bdt": sw[7], "tags": [sw[8]] })

    # BEVERAGES & DAIRY (15)
    bevs = [
        ("Milk (Dudh)", "দুধ", 122, 8.0, 12, 5.0, 0, "20-30 ৳", "calcium"), # MILK
        ("Tea (Milk)", "দুধ চা", 60, 1.5, 10, 1.5, 0, "10-15 ৳", "caffeine"),
        ("Tea (Black/Raw)", "রং চা", 5, 0.1, 1.0, 0, 0, "5-10 ৳", "caffeine"),
        ("Coffee (Milk)", "কফি", 80, 2.0, 12, 2.5, 0, "20-40 ৳", "caffeine"),
        ("Lassi", "লাচ্ছি", 165, 6.0, 28, 3.5, 0, "40-60 ৳", "probiotic"),
        ("Borhani", "বোরহানী", 80, 3.0, 12, 2.0, 0, "30-50 ৳", "digestive"),
        ("Sugarcane Juice", "আখের রস", 180, 0.3, 45, 0, 0, "20-30 ৳", "energy"),
        ("Lemon Water", "লেবুর শরবত", 45, 0.2, 12, 0, 0, "10-15 ৳", "vitamin-c"),
        ("Green Coconut Water", "ডাবের পানি", 57, 0.7, 12, 0.5, 0, "40-60 ৳", "hydrating"),
        ("Mango Juice", "আমের জুস", 120, 1.0, 28, 0.5, 1.0, "30-60 ৳", "sugar"),
        ("Soft Drink (Cola)", "কোমল পানীয়", 140, 0, 39, 0, 0, "25-35 ৳", "sugar"),
    ]
    for b in bevs:
        foods.append({ "name_en": b[0], "name_bn": b[1], "category": "beverages", "serving": "1 serving", "calories": b[2], "protein_g": b[3], "carbs_g": b[4], "fat_g": b[5], "fiber_g": b[6], "price_bdt": b[7], "tags": [b[8]] })

    # Write to JSON
    with open("src/backend/data/foods.json", "w", encoding="utf-8") as f:
        json.dump(foods, f, ensure_ascii=False, indent=2)
    print(f"Generated {len(foods)} foods in foods.json")

if __name__ == "__main__":
    generate_foods()
