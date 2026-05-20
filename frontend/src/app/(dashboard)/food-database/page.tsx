"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Wheat,
  Fish,
  Leaf,
  Coffee,
  Cookie,
  Flame,
  Droplets,
  Zap,
  ChevronDown,
  BookOpen,
} from "lucide-react";

/* ── Food Database — Static Bangladeshi food entries ── */

interface FoodEntry {
  name_en: string;
  name_bn: string;
  category: string;
  serving: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  price_bdt: string;
  tags: string[];
}

const CATEGORIES = [
  { key: "all", label: "All Foods", labelBn: "সব খাবার", icon: BookOpen },
  { key: "rice_grains", label: "Rice & Grains", labelBn: "ভাত ও শস্য", icon: Wheat },
  { key: "dal_pulses", label: "Dal & Pulses", labelBn: "ডাল ও ডালজাতীয়", icon: Droplets },
  { key: "fish_meat", label: "Fish & Meat", labelBn: "মাছ ও মাংস", icon: Fish },
  { key: "vegetables", label: "Vegetables", labelBn: "শাক-সবজি", icon: Leaf },
  { key: "fruits", label: "Fruits", labelBn: "ফলমূল", icon: Zap },
  { key: "street_food", label: "Street Food", labelBn: "রাস্তার খাবার", icon: Flame },
  { key: "sweets", label: "Sweets & Desserts", labelBn: "মিষ্টি", icon: Cookie },
  { key: "beverages", label: "Beverages", labelBn: "পানীয়", icon: Coffee },
];

const FOODS: FoodEntry[] = [
  // Rice & Grains
  { name_en: "White Rice (cooked)", name_bn: "সাদা ভাত", category: "rice_grains", serving: "1 cup (200g)", calories: 260, protein_g: 5.4, carbs_g: 56, fat_g: 0.6, fiber_g: 0.6, price_bdt: "8-10 ৳", tags: ["staple", "gluten-free"] },
  { name_en: "Brown Rice (cooked)", name_bn: "লাল চালের ভাত", category: "rice_grains", serving: "1 cup (200g)", calories: 248, protein_g: 5.5, carbs_g: 52, fat_g: 2.0, fiber_g: 3.5, price_bdt: "15-20 ৳", tags: ["fiber", "diabetes-friendly"] },
  { name_en: "Roti / Chapati", name_bn: "রুটি / চাপাতি", category: "rice_grains", serving: "1 piece (40g)", calories: 104, protein_g: 3.0, carbs_g: 18, fat_g: 2.5, fiber_g: 1.3, price_bdt: "5-8 ৳", tags: ["fiber", "diabetes-friendly"] },
  { name_en: "Paratha", name_bn: "পরাটা", category: "rice_grains", serving: "1 piece (80g)", calories: 260, protein_g: 5.0, carbs_g: 30, fat_g: 13, fiber_g: 1.5, price_bdt: "10-15 ৳", tags: ["fried", "high-calorie"] },
  { name_en: "Khichuri", name_bn: "খিচুড়ি", category: "rice_grains", serving: "1 cup (250g)", calories: 215, protein_g: 7.0, carbs_g: 38, fat_g: 4.5, fiber_g: 2.5, price_bdt: "15-20 ৳", tags: ["comfort-food", "protein"] },
  { name_en: "Panta Bhat", name_bn: "পান্তা ভাত", category: "rice_grains", serving: "1 cup (250g)", calories: 180, protein_g: 3.5, carbs_g: 40, fat_g: 0.4, fiber_g: 1.0, price_bdt: "5-8 ৳", tags: ["probiotic", "traditional"] },
  { name_en: "Chira (Flattened Rice)", name_bn: "চিঁড়া", category: "rice_grains", serving: "1 cup (50g)", calories: 175, protein_g: 3.5, carbs_g: 39, fat_g: 0.5, fiber_g: 0.8, price_bdt: "8-10 ৳", tags: ["snack", "light"] },
  { name_en: "Muri (Puffed Rice)", name_bn: "মুড়ি", category: "rice_grains", serving: "1 cup (30g)", calories: 110, protein_g: 2.0, carbs_g: 25, fat_g: 0.3, fiber_g: 0.5, price_bdt: "3-5 ৳", tags: ["snack", "low-calorie"] },

  // Dal & Pulses
  { name_en: "Masoor Dal (Red Lentil)", name_bn: "মসুর ডাল", category: "dal_pulses", serving: "1 cup cooked (200g)", calories: 230, protein_g: 18.0, carbs_g: 40, fat_g: 0.7, fiber_g: 8.0, price_bdt: "20-25 ৳", tags: ["protein", "iron", "budget"] },
  { name_en: "Mung Dal (Green Gram)", name_bn: "মুগ ডাল", category: "dal_pulses", serving: "1 cup cooked (200g)", calories: 212, protein_g: 14.2, carbs_g: 38, fat_g: 0.8, fiber_g: 7.5, price_bdt: "22-28 ৳", tags: ["protein", "easy-digest"] },
  { name_en: "Cholar Dal (Bengal Gram)", name_bn: "ছোলার ডাল", category: "dal_pulses", serving: "1 cup cooked (200g)", calories: 269, protein_g: 15.0, carbs_g: 45, fat_g: 4.2, fiber_g: 8.0, price_bdt: "20-30 ৳", tags: ["protein", "fiber"] },
  { name_en: "Motor Dal (Yellow Peas)", name_bn: "মটর ডাল", category: "dal_pulses", serving: "1 cup cooked (200g)", calories: 231, protein_g: 16.3, carbs_g: 41, fat_g: 1.0, fiber_g: 8.3, price_bdt: "18-22 ৳", tags: ["protein", "budget"] },
  { name_en: "Chhola (Chickpeas)", name_bn: "ছোলা (বুট)", category: "dal_pulses", serving: "1 cup cooked (160g)", calories: 269, protein_g: 14.5, carbs_g: 45, fat_g: 4.2, fiber_g: 12.5, price_bdt: "25-30 ৳", tags: ["protein", "fiber", "iron"] },
  { name_en: "Khesari Dal", name_bn: "খেসারি ডাল", category: "dal_pulses", serving: "1 cup cooked (200g)", calories: 210, protein_g: 16.0, carbs_g: 36, fat_g: 0.6, fiber_g: 6.0, price_bdt: "12-15 ৳", tags: ["budget", "protein"] },

  // Fish & Meat
  { name_en: "Hilsha (Ilish) Fish", name_bn: "ইলিশ মাছ", category: "fish_meat", serving: "1 piece (100g)", calories: 273, protein_g: 22.0, carbs_g: 0, fat_g: 20.0, fiber_g: 0, price_bdt: "100-200 ৳", tags: ["omega-3", "premium"] },
  { name_en: "Rohu Fish", name_bn: "রুই মাছ", category: "fish_meat", serving: "1 piece (100g)", calories: 97, protein_g: 17.0, carbs_g: 0, fat_g: 3.0, fiber_g: 0, price_bdt: "25-40 ৳", tags: ["protein", "lean"] },
  { name_en: "Tilapia Fish", name_bn: "তেলাপিয়া মাছ", category: "fish_meat", serving: "1 piece (100g)", calories: 96, protein_g: 20.0, carbs_g: 0, fat_g: 1.7, fiber_g: 0, price_bdt: "15-25 ৳", tags: ["protein", "budget", "lean"] },
  { name_en: "Pangas Fish", name_bn: "পাঙ্গাশ মাছ", category: "fish_meat", serving: "1 piece (100g)", calories: 90, protein_g: 15.0, carbs_g: 0, fat_g: 3.5, fiber_g: 0, price_bdt: "10-18 ৳", tags: ["budget", "protein"] },
  { name_en: "Katla Fish", name_bn: "কাতলা মাছ", category: "fish_meat", serving: "1 piece (100g)", calories: 105, protein_g: 18.0, carbs_g: 0, fat_g: 3.2, fiber_g: 0, price_bdt: "30-50 ৳", tags: ["protein"] },
  { name_en: "Shutki (Dried Fish)", name_bn: "শুটকি মাছ", category: "fish_meat", serving: "50g", calories: 160, protein_g: 32.0, carbs_g: 0, fat_g: 3.5, fiber_g: 0, price_bdt: "30-60 ৳", tags: ["protein", "calcium", "shelf-stable"] },
  { name_en: "Chicken (curry)", name_bn: "মুরগির মাংস (তরকারি)", category: "fish_meat", serving: "1 piece (100g)", calories: 185, protein_g: 25.0, carbs_g: 2, fat_g: 8.5, fiber_g: 0, price_bdt: "25-35 ৳", tags: ["protein"] },
  { name_en: "Beef (curry)", name_bn: "গরুর মাংস (তরকারি)", category: "fish_meat", serving: "100g", calories: 250, protein_g: 26.0, carbs_g: 3, fat_g: 15.0, fiber_g: 0, price_bdt: "50-70 ৳", tags: ["protein", "iron", "high-calorie"] },
  { name_en: "Egg (boiled)", name_bn: "ডিম (সেদ্ধ)", category: "fish_meat", serving: "1 large (50g)", calories: 78, protein_g: 6.3, carbs_g: 0.6, fat_g: 5.3, fiber_g: 0, price_bdt: "12-15 ৳", tags: ["protein", "budget"] },
  { name_en: "Macher Jhol (Fish Curry)", name_bn: "মাছের ঝোল", category: "fish_meat", serving: "1 bowl (250g)", calories: 180, protein_g: 18.0, carbs_g: 8, fat_g: 9.0, fiber_g: 1.0, price_bdt: "30-50 ৳", tags: ["traditional", "protein"] },

  // Vegetables
  { name_en: "Potato (aloo)", name_bn: "আলু", category: "vegetables", serving: "1 medium (150g)", calories: 130, protein_g: 3.0, carbs_g: 30, fat_g: 0.2, fiber_g: 3.6, price_bdt: "5-8 ৳", tags: ["staple", "budget"] },
  { name_en: "Aloo Bhorta", name_bn: "আলু ভর্তা", category: "vegetables", serving: "1 serving (100g)", calories: 120, protein_g: 2.5, carbs_g: 18, fat_g: 5.0, fiber_g: 2.0, price_bdt: "8-12 ৳", tags: ["traditional", "comfort-food"] },
  { name_en: "Begun Bhaji (Eggplant)", name_bn: "বেগুন ভাজি", category: "vegetables", serving: "1 cup (100g)", calories: 140, protein_g: 2.0, carbs_g: 12, fat_g: 10.0, fiber_g: 3.0, price_bdt: "10-15 ৳", tags: ["fried", "fiber"] },
  { name_en: "Palong Shak (Spinach)", name_bn: "পালং শাক", category: "vegetables", serving: "1 cup cooked (180g)", calories: 41, protein_g: 5.4, carbs_g: 7, fat_g: 0.5, fiber_g: 4.3, price_bdt: "5-8 ৳", tags: ["iron", "calcium", "budget"] },
  { name_en: "Lal Shak (Red Amaranth)", name_bn: "লাল শাক", category: "vegetables", serving: "1 cup cooked (150g)", calories: 35, protein_g: 3.5, carbs_g: 6, fat_g: 0.4, fiber_g: 3.0, price_bdt: "3-5 ৳", tags: ["iron", "budget", "vitamin-a"] },
  { name_en: "Pui Shak (Malabar Spinach)", name_bn: "পুঁই শাক", category: "vegetables", serving: "1 cup cooked (150g)", calories: 30, protein_g: 3.0, carbs_g: 5, fat_g: 0.3, fiber_g: 2.5, price_bdt: "3-5 ৳", tags: ["iron", "budget"] },
  { name_en: "Misti Kumra (Sweet Pumpkin)", name_bn: "মিষ্টি কুমড়া", category: "vegetables", serving: "1 cup (150g)", calories: 49, protein_g: 1.8, carbs_g: 12, fat_g: 0.2, fiber_g: 1.5, price_bdt: "5-8 ৳", tags: ["vitamin-a", "fiber"] },
  { name_en: "Korola (Bitter Gourd)", name_bn: "করলা", category: "vegetables", serving: "1 cup (100g)", calories: 20, protein_g: 1.0, carbs_g: 4, fat_g: 0.2, fiber_g: 2.0, price_bdt: "8-12 ৳", tags: ["diabetes-friendly", "low-calorie"] },
  { name_en: "Dheros (Okra/Lady's Finger)", name_bn: "ঢেঁড়স", category: "vegetables", serving: "1 cup (100g)", calories: 33, protein_g: 2.0, carbs_g: 7, fat_g: 0.2, fiber_g: 3.2, price_bdt: "8-12 ৳", tags: ["fiber", "low-calorie"] },
  { name_en: "Lau (Bottle Gourd)", name_bn: "লাউ", category: "vegetables", serving: "1 cup (120g)", calories: 18, protein_g: 0.7, carbs_g: 4, fat_g: 0.1, fiber_g: 1.2, price_bdt: "5-8 ৳", tags: ["low-calorie", "hydrating"] },
  { name_en: "Potol (Pointed Gourd)", name_bn: "পটল", category: "vegetables", serving: "1 cup (100g)", calories: 20, protein_g: 2.0, carbs_g: 3.5, fat_g: 0.3, fiber_g: 1.5, price_bdt: "8-15 ৳", tags: ["low-calorie", "diabetes-friendly"] },
  { name_en: "Data Shak (Stem Amaranth)", name_bn: "ডাটা শাক", category: "vegetables", serving: "1 cup cooked (150g)", calories: 28, protein_g: 2.5, carbs_g: 5, fat_g: 0.3, fiber_g: 2.0, price_bdt: "3-5 ৳", tags: ["iron", "calcium", "budget"] },

  // Fruits
  { name_en: "Banana (Kola)", name_bn: "কলা", category: "fruits", serving: "1 medium (120g)", calories: 105, protein_g: 1.3, carbs_g: 27, fat_g: 0.4, fiber_g: 3.1, price_bdt: "5-8 ৳", tags: ["potassium", "energy"] },
  { name_en: "Mango (Aam)", name_bn: "আম", category: "fruits", serving: "1 cup (165g)", calories: 99, protein_g: 1.4, carbs_g: 25, fat_g: 0.6, fiber_g: 2.6, price_bdt: "15-30 ৳", tags: ["vitamin-a", "vitamin-c", "seasonal"] },
  { name_en: "Jackfruit (Kathal)", name_bn: "কাঁঠাল", category: "fruits", serving: "1 cup (165g)", calories: 155, protein_g: 2.8, carbs_g: 40, fat_g: 1.0, fiber_g: 2.5, price_bdt: "10-20 ৳", tags: ["energy", "fiber", "seasonal"] },
  { name_en: "Papaya (Pepe)", name_bn: "পেঁপে", category: "fruits", serving: "1 cup (145g)", calories: 62, protein_g: 0.7, carbs_g: 16, fat_g: 0.4, fiber_g: 2.5, price_bdt: "5-10 ৳", tags: ["vitamin-c", "digestion"] },
  { name_en: "Guava (Peyara)", name_bn: "পেয়ারা", category: "fruits", serving: "1 medium (100g)", calories: 68, protein_g: 2.6, carbs_g: 14, fat_g: 1.0, fiber_g: 5.4, price_bdt: "5-10 ৳", tags: ["vitamin-c", "fiber", "budget"] },
  { name_en: "Green Coconut Water (Dab)", name_bn: "ডাবের পানি", category: "fruits", serving: "1 coconut (300ml)", calories: 57, protein_g: 0.7, carbs_g: 12, fat_g: 0.5, fiber_g: 0, price_bdt: "30-50 ৳", tags: ["electrolyte", "hydrating"] },
  { name_en: "Litchi", name_bn: "লিচু", category: "fruits", serving: "10 pieces (100g)", calories: 66, protein_g: 0.8, carbs_g: 17, fat_g: 0.4, fiber_g: 1.3, price_bdt: "15-30 ৳", tags: ["vitamin-c", "seasonal"] },
  { name_en: "Watermelon (Tormuj)", name_bn: "তরমুজ", category: "fruits", serving: "1 cup (150g)", calories: 46, protein_g: 0.9, carbs_g: 12, fat_g: 0.2, fiber_g: 0.6, price_bdt: "5-8 ৳", tags: ["hydrating", "low-calorie", "seasonal"] },

  // Street Food
  { name_en: "Fuchka / Panipuri", name_bn: "ফুচকা", category: "street_food", serving: "6 pieces", calories: 280, protein_g: 5.0, carbs_g: 45, fat_g: 9.0, fiber_g: 3.0, price_bdt: "20-30 ৳", tags: ["high-sodium", "fried"] },
  { name_en: "Chotpoti", name_bn: "চটপটি", category: "street_food", serving: "1 bowl (200g)", calories: 310, protein_g: 8.0, carbs_g: 48, fat_g: 10.0, fiber_g: 5.0, price_bdt: "25-40 ৳", tags: ["fiber", "protein", "spicy"] },
  { name_en: "Jhalmuri", name_bn: "ঝালমুড়ি", category: "street_food", serving: "1 serving (100g)", calories: 180, protein_g: 3.5, carbs_g: 30, fat_g: 6.0, fiber_g: 2.0, price_bdt: "15-20 ৳", tags: ["snack", "light"] },
  { name_en: "Singara (Samosa)", name_bn: "সিঙ্গারা", category: "street_food", serving: "2 pieces (100g)", calories: 290, protein_g: 4.5, carbs_g: 30, fat_g: 17.0, fiber_g: 2.5, price_bdt: "10-20 ৳", tags: ["fried", "high-calorie"] },
  { name_en: "Pitha (Rice Cake)", name_bn: "পিঠা", category: "street_food", serving: "2 pieces (100g)", calories: 230, protein_g: 3.5, carbs_g: 42, fat_g: 6.0, fiber_g: 1.5, price_bdt: "10-20 ৳", tags: ["traditional", "seasonal"] },
  { name_en: "Mughlai Paratha", name_bn: "মোগলাই পরাটা", category: "street_food", serving: "1 piece (200g)", calories: 520, protein_g: 16.0, carbs_g: 45, fat_g: 30.0, fiber_g: 2.0, price_bdt: "40-60 ৳", tags: ["high-calorie", "fried"] },

  // Sweets & Desserts
  { name_en: "Mishti Doi (Sweet Yogurt)", name_bn: "মিষ্টি দই", category: "sweets", serving: "1 cup (150g)", calories: 180, protein_g: 5.0, carbs_g: 30, fat_g: 5.0, fiber_g: 0, price_bdt: "20-35 ৳", tags: ["calcium", "probiotic", "sugar"] },
  { name_en: "Roshogolla", name_bn: "রসগোল্লা", category: "sweets", serving: "2 pieces (100g)", calories: 186, protein_g: 5.0, carbs_g: 35, fat_g: 3.5, fiber_g: 0, price_bdt: "20-30 ৳", tags: ["sugar", "calcium"] },
  { name_en: "Payesh (Rice Pudding)", name_bn: "পায়েশ", category: "sweets", serving: "1 cup (200g)", calories: 270, protein_g: 7.0, carbs_g: 45, fat_g: 8.0, fiber_g: 0.5, price_bdt: "20-30 ৳", tags: ["calcium", "sugar", "comfort-food"] },
  { name_en: "Jilapi / Jalebi", name_bn: "জিলাপি", category: "sweets", serving: "3 pieces (100g)", calories: 380, protein_g: 2.0, carbs_g: 60, fat_g: 15.0, fiber_g: 0, price_bdt: "20-30 ৳", tags: ["sugar", "fried", "high-calorie"] },
  { name_en: "Shandesh", name_bn: "সন্দেশ", category: "sweets", serving: "2 pieces (80g)", calories: 200, protein_g: 6.0, carbs_g: 30, fat_g: 7.0, fiber_g: 0, price_bdt: "25-40 ৳", tags: ["calcium", "sugar"] },

  // Beverages
  { name_en: "Cha (Tea with milk)", name_bn: "চা (দুধ চা)", category: "beverages", serving: "1 cup (150ml)", calories: 60, protein_g: 1.5, carbs_g: 10, fat_g: 1.5, fiber_g: 0, price_bdt: "5-10 ৳", tags: ["caffeine"] },
  { name_en: "Lassi (Sweet yogurt drink)", name_bn: "লাচ্ছি", category: "beverages", serving: "1 glass (250ml)", calories: 165, protein_g: 6.0, carbs_g: 28, fat_g: 3.5, fiber_g: 0, price_bdt: "20-35 ৳", tags: ["calcium", "probiotic"] },
  { name_en: "Borhani", name_bn: "বোরহানী", category: "beverages", serving: "1 glass (250ml)", calories: 80, protein_g: 3.0, carbs_g: 12, fat_g: 2.0, fiber_g: 0, price_bdt: "15-25 ৳", tags: ["probiotic", "digestive"] },
  { name_en: "Sugarcane Juice (Akhher Rosh)", name_bn: "আখের রস", category: "beverages", serving: "1 glass (250ml)", calories: 180, protein_g: 0.3, carbs_g: 45, fat_g: 0, fiber_g: 0, price_bdt: "15-25 ৳", tags: ["energy", "sugar"] },
  { name_en: "Lemon Water (Lebur Shorbot)", name_bn: "লেবুর শরবত", category: "beverages", serving: "1 glass (250ml)", calories: 45, protein_g: 0.2, carbs_g: 12, fat_g: 0, fiber_g: 0, price_bdt: "5-10 ৳", tags: ["vitamin-c", "hydrating", "budget"] },
];

/* ── Macro color helpers ── */
function getCalorieBadge(cal: number): string {
  if (cal <= 80) return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400";
  if (cal <= 200) return "bg-blue-500/15 text-blue-600 dark:text-blue-400";
  if (cal <= 350) return "bg-amber-500/15 text-amber-600 dark:text-amber-400";
  return "bg-red-500/15 text-red-600 dark:text-red-400";
}

/* ── Component ── */
export default function FoodDatabasePage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "calories" | "protein" | "price">("name");
  const [expandedFood, setExpandedFood] = useState<string | null>(null);

  const filteredFoods = useMemo(() => {
    let foods = FOODS;

    // Category filter
    if (selectedCategory !== "all") {
      foods = foods.filter((f) => f.category === selectedCategory);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      foods = foods.filter(
        (f) =>
          f.name_en.toLowerCase().includes(q) ||
          f.name_bn.includes(q) ||
          f.tags.some((t) => t.includes(q)),
      );
    }

    // Sort
    foods = [...foods].sort((a, b) => {
      if (sortBy === "calories") return a.calories - b.calories;
      if (sortBy === "protein") return b.protein_g - a.protein_g;
      if (sortBy === "price") return parseInt(a.price_bdt) - parseInt(b.price_bdt);
      return a.name_en.localeCompare(b.name_en);
    });

    return foods;
  }, [search, selectedCategory, sortBy]);

  const stats = useMemo(() => {
    const cat = selectedCategory === "all" ? FOODS : FOODS.filter((f) => f.category === selectedCategory);
    const avgCal = Math.round(cat.reduce((s, f) => s + f.calories, 0) / cat.length);
    const avgProtein = (cat.reduce((s, f) => s + f.protein_g, 0) / cat.length).toFixed(1);
    return { total: cat.length, avgCal, avgProtein };
  }, [selectedCategory]);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[color:var(--foreground)]">
            Bangladeshi Food Database 🇧🇩
          </h2>
          <p className="text-sm text-[color:var(--muted)]">
            Nutrition data for {FOODS.length}+ common Bangladeshi foods with BDT pricing
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-center">
          <p className="text-2xl font-black text-[color:var(--primary)]">{stats.total}</p>
          <p className="text-[11px] text-[color:var(--muted)]">Foods</p>
        </div>
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-center">
          <p className="text-2xl font-black text-amber-500">{stats.avgCal}</p>
          <p className="text-[11px] text-[color:var(--muted)]">Avg Calories</p>
        </div>
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-center">
          <p className="text-2xl font-black text-emerald-500">{stats.avgProtein}g</p>
          <p className="text-[11px] text-[color:var(--muted)]">Avg Protein</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search foods... (e.g. ডাল, rice, protein, budget)"
            className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] py-2.5 pl-10 pr-4 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--primary)]/60 focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/20 transition-colors"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)]" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="appearance-none rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] py-2.5 pl-9 pr-10 text-sm text-[color:var(--foreground)] focus:outline-none"
          >
            <option value="name">Sort: Name</option>
            <option value="calories">Sort: Calories ↑</option>
            <option value="protein">Sort: Protein ↓</option>
            <option value="price">Sort: Price ↑</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)] pointer-events-none" />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={[
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                isActive
                  ? "bg-[color:var(--primary)] text-white shadow-md"
                  : "border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--muted)] hover:border-[color:var(--primary)]/40 hover:text-[color:var(--foreground)]",
              ].join(" ")}
            >
              <Icon size={13} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Results count */}
      <p className="text-xs text-[color:var(--muted)]">
        Showing {filteredFoods.length} of {FOODS.length} foods
      </p>

      {/* Food grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredFoods.map((food) => {
          const isExpanded = expandedFood === food.name_en;
          return (
            <button
              key={food.name_en}
              type="button"
              onClick={() => setExpandedFood(isExpanded ? null : food.name_en)}
              className={[
                "group text-left rounded-2xl border transition-all duration-200",
                isExpanded
                  ? "border-[color:var(--primary)]/40 bg-[color:var(--primary)]/5 shadow-lg"
                  : "border-[color:var(--border)] bg-[color:var(--surface)] hover:border-[color:var(--primary)]/30 hover:shadow-md",
              ].join(" ")}
            >
              {/* Top section */}
              <div className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[color:var(--foreground)] truncate">
                      {food.name_en}
                    </p>
                    <p className="text-xs text-[color:var(--muted)]">{food.name_bn}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${getCalorieBadge(food.calories)}`}
                  >
                    {food.calories} cal
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-[color:var(--muted)]">{food.serving}</p>

                {/* Macro bar */}
                <div className="mt-2.5 flex gap-3 text-[11px]">
                  <span className="text-blue-500 font-semibold">P {food.protein_g}g</span>
                  <span className="text-amber-500 font-semibold">C {food.carbs_g}g</span>
                  <span className="text-red-400 font-semibold">F {food.fat_g}g</span>
                  {food.fiber_g > 0 && (
                    <span className="text-emerald-500 font-semibold">Fi {food.fiber_g}g</span>
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t border-[color:var(--border)] px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[color:var(--muted)]">Price estimate:</span>
                    <span className="font-bold text-[color:var(--foreground)]">{food.price_bdt}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {food.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[color:var(--surface-soft)] border border-[color:var(--border)] px-2 py-0.5 text-[10px] text-[color:var(--muted)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Visual macro breakdown */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-medium text-[color:var(--muted)]">Macro breakdown:</p>
                    {[
                      { label: "Protein", value: food.protein_g, max: 35, color: "bg-blue-500" },
                      { label: "Carbs", value: food.carbs_g, max: 60, color: "bg-amber-500" },
                      { label: "Fat", value: food.fat_g, max: 30, color: "bg-red-400" },
                    ].map((m) => (
                      <div key={m.label} className="flex items-center gap-2">
                        <span className="w-12 text-[10px] text-[color:var(--muted)]">{m.label}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-[color:var(--surface-muted)]">
                          <div
                            className={`h-full rounded-full ${m.color} transition-all`}
                            style={{ width: `${Math.min((m.value / m.max) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-[10px] font-medium text-[color:var(--foreground)]">
                          {m.value}g
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {filteredFoods.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-lg font-bold text-[color:var(--foreground)]">No foods found</p>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Try a different search term or category
          </p>
        </div>
      )}

      {/* Footer note */}
      <div className="rounded-xl bg-[color:var(--surface-muted)] px-4 py-3 text-xs text-[color:var(--muted)] italic">
        📊 Nutritional values are approximate and based on standard serving sizes. Actual values may vary
        by preparation method and ingredient sourcing. Prices are estimated based on 2024-2025 Bangladesh
        market rates and may vary by region and season.
      </div>
    </div>
  );
}
