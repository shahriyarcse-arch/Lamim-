// Generated from legacy/app/js/finance.js. Category ids MUST match legacy ids (imported expenses reference them).

export const CATEGORY_SECTIONS = [
  'bazar_and_food',
  'transport',
  'household',
  'tech_and_freelance',
  'business_and_office',
  'medical',
  'education',
  'agro_and_farming',
  'creative',
  'social_and_religious',
  'personal_and_grooming',
  'finance_and_legal',
  'entertainment',
  'other',
] as const;

export type CategorySection = (typeof CATEGORY_SECTIONS)[number];

export interface FinanceCategory {
  id: string;
  /** English name (legacy names include Bangla transliterations in parentheses). */
  name: string;
  section: CategorySection;
}

export const FINANCE_CATEGORIES: readonly FinanceCategory[] = [
  {
    id: 'bazar',
    name: 'Kacha Bazar',
    section: 'bazar_and_food',
  },
  {
    id: 'fish',
    name: 'Fish (Maach)',
    section: 'bazar_and_food',
  },
  {
    id: 'meat',
    name: 'Meat (Goru/Khashi)',
    section: 'bazar_and_food',
  },
  {
    id: 'chicken',
    name: 'Chicken (Murgi)',
    section: 'bazar_and_food',
  },
  {
    id: 'grocery',
    name: 'Grocery (Mudi)',
    section: 'bazar_and_food',
  },
  {
    id: 'rice',
    name: 'Rice (Chaal)',
    section: 'bazar_and_food',
  },
  {
    id: 'oil',
    name: 'Oil & Spices',
    section: 'bazar_and_food',
  },
  {
    id: 'dal',
    name: 'Dal / Lentils',
    section: 'bazar_and_food',
  },
  {
    id: 'salt_sugar',
    name: 'Salt & Sugar',
    section: 'bazar_and_food',
  },
  {
    id: 'snacks',
    name: 'Snacks (Chanachur)',
    section: 'bazar_and_food',
  },
  {
    id: 'tea',
    name: 'Tea & Biscuits',
    section: 'bazar_and_food',
  },
  {
    id: 'sweet',
    name: 'Sweets (Misti)',
    section: 'bazar_and_food',
  },
  {
    id: 'fruit',
    name: 'Fruits (Phol)',
    section: 'bazar_and_food',
  },
  {
    id: 'milk',
    name: 'Milk & Dairy',
    section: 'bazar_and_food',
  },
  {
    id: 'yogurt',
    name: 'Yogurt (Doi)',
    section: 'bazar_and_food',
  },
  {
    id: 'egg',
    name: 'Eggs (Dim)',
    section: 'bazar_and_food',
  },
  {
    id: 'bread',
    name: 'Bread & Bakery',
    section: 'bazar_and_food',
  },
  {
    id: 'baby_food',
    name: 'Baby Food / Cerelac',
    section: 'bazar_and_food',
  },
  {
    id: 'frozen_food',
    name: 'Frozen Food',
    section: 'bazar_and_food',
  },
  {
    id: 'baking',
    name: 'Baking Items',
    section: 'bazar_and_food',
  },
  {
    id: 'water',
    name: 'Mineral Water',
    section: 'bazar_and_food',
  },
  {
    id: 'juice',
    name: 'Juice / Drinks',
    section: 'bazar_and_food',
  },
  {
    id: 'streetfood',
    name: 'Street Food',
    section: 'bazar_and_food',
  },
  {
    id: 'fuchka',
    name: 'Fuchka / Chotpoti',
    section: 'bazar_and_food',
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    section: 'bazar_and_food',
  },
  {
    id: 'cafe',
    name: 'Cafe / Coffee',
    section: 'bazar_and_food',
  },
  {
    id: 'fastfood',
    name: 'Burger / Pizza',
    section: 'bazar_and_food',
  },
  {
    id: 'biryani',
    name: 'Biryani / Tehari',
    section: 'bazar_and_food',
  },
  {
    id: 'rickshaw',
    name: 'Rickshaw Fare',
    section: 'transport',
  },
  {
    id: 'cng',
    name: 'CNG Fare',
    section: 'transport',
  },
  {
    id: 'bus',
    name: 'Bus Fare',
    section: 'transport',
  },
  {
    id: 'uber',
    name: 'Uber / Pathao',
    section: 'transport',
  },
  {
    id: 'fuel',
    name: 'Fuel (Octane/LPG)',
    section: 'transport',
  },
  {
    id: 'cng_refill',
    name: 'CNG Refill',
    section: 'transport',
  },
  {
    id: 'engineoil',
    name: 'Engine Oil / Lube',
    section: 'transport',
  },
  {
    id: 'carrepair',
    name: 'Car/Bike Repair',
    section: 'transport',
  },
  {
    id: 'carwash',
    name: 'Car Wash',
    section: 'transport',
  },
  {
    id: 'tyre',
    name: 'Tyres / Parts',
    section: 'transport',
  },
  {
    id: 'battery',
    name: 'Car/Bike Battery',
    section: 'transport',
  },
  {
    id: 'parking',
    name: 'Parking Fee',
    section: 'transport',
  },
  {
    id: 'toll',
    name: 'Bridge Toll',
    section: 'transport',
  },
  {
    id: 'fitness',
    name: 'Vehicle Fitness',
    section: 'transport',
  },
  {
    id: 'tax_token',
    name: 'Tax Token',
    section: 'transport',
  },
  {
    id: 'route_permit',
    name: 'Route Permit',
    section: 'transport',
  },
  {
    id: 'driving_license',
    name: 'Driving License',
    section: 'transport',
  },
  {
    id: 'launch',
    name: 'Launch / Steamer',
    section: 'transport',
  },
  {
    id: 'train',
    name: 'Train Fare',
    section: 'transport',
  },
  {
    id: 'flight',
    name: 'Flight Ticket',
    section: 'transport',
  },
  {
    id: 'rent',
    name: 'House Rent',
    section: 'household',
  },
  {
    id: 'electricity',
    name: 'Electricity Bill',
    section: 'household',
  },
  {
    id: 'wasa',
    name: 'WASA Bill',
    section: 'household',
  },
  {
    id: 'gas',
    name: 'Titas Gas Bill',
    section: 'household',
  },
  {
    id: 'lp_gas',
    name: 'LP Gas Cylinder',
    section: 'household',
  },
  {
    id: 'internet',
    name: 'Broadband',
    section: 'household',
  },
  {
    id: 'cabletv',
    name: 'Cable TV / Dish',
    section: 'household',
  },
  {
    id: 'garbage',
    name: 'Garbage Bill',
    section: 'household',
  },
  {
    id: 'maid',
    name: 'Maid Salary',
    section: 'household',
  },
  {
    id: 'guard',
    name: 'Security Guard',
    section: 'household',
  },
  {
    id: 'laundry',
    name: 'Laundry / Ironing',
    section: 'household',
  },
  {
    id: 'homerepair',
    name: 'Home Repair',
    section: 'household',
  },
  {
    id: 'kitchen',
    name: 'Kitchenware',
    section: 'household',
  },
  {
    id: 'cleaning_kit',
    name: 'Cleaning Kit',
    section: 'household',
  },
  {
    id: 'pest_control',
    name: 'Pest Control',
    section: 'household',
  },
  {
    id: 'furniture',
    name: 'Furniture',
    section: 'household',
  },
  {
    id: 'bedding',
    name: 'Bedding / Curtains',
    section: 'household',
  },
  {
    id: 'plants',
    name: 'Plants / Garden',
    section: 'household',
  },
  {
    id: 'bulb',
    name: 'Bulbs / Electrical',
    section: 'household',
  },
  {
    id: 'domain',
    name: 'Domain Name',
    section: 'tech_and_freelance',
  },
  {
    id: 'hosting',
    name: 'Web Hosting',
    section: 'tech_and_freelance',
  },
  {
    id: 'saas',
    name: 'SaaS Subscription',
    section: 'tech_and_freelance',
  },
  {
    id: 'creative_cloud',
    name: 'Adobe / Design',
    section: 'tech_and_freelance',
  },
  {
    id: 'github',
    name: 'GitHub / Coding',
    section: 'tech_and_freelance',
  },
  {
    id: 'chatgpt',
    name: 'AI / ChatGPT',
    section: 'tech_and_freelance',
  },
  {
    id: 'cloud_storage',
    name: 'Google/iCloud',
    section: 'tech_and_freelance',
  },
  {
    id: 'app_store',
    name: 'App / Play Store',
    section: 'tech_and_freelance',
  },
  {
    id: 'freelance_fee',
    name: 'Upwork/Fiverr Fee',
    section: 'tech_and_freelance',
  },
  {
    id: 'pc_hardware',
    name: 'PC Parts / GPU',
    section: 'tech_and_freelance',
  },
  {
    id: 'keyboard_mouse',
    name: 'Peripherals',
    section: 'tech_and_freelance',
  },
  {
    id: 'monitor',
    name: 'Monitor / Display',
    section: 'tech_and_freelance',
  },
  {
    id: 'coworking',
    name: 'Coworking Space',
    section: 'tech_and_freelance',
  },
  {
    id: 'vpn',
    name: 'VPN Subscription',
    section: 'tech_and_freelance',
  },
  {
    id: 'software_lic',
    name: 'Software License',
    section: 'tech_and_freelance',
  },
  {
    id: 'wholesale',
    name: 'Wholesale Stock',
    section: 'business_and_office',
  },
  {
    id: 'shop_rent',
    name: 'Shop / Office Rent',
    section: 'business_and_office',
  },
  {
    id: 'staff_salary',
    name: 'Staff Salary',
    section: 'business_and_office',
  },
  {
    id: 'staff_lunch',
    name: 'Staff Lunch',
    section: 'business_and_office',
  },
  {
    id: 'packaging',
    name: 'Packing Materials',
    section: 'business_and_office',
  },
  {
    id: 'marketing',
    name: 'Ads / Marketing',
    section: 'business_and_office',
  },
  {
    id: 'trade_license',
    name: 'Trade License',
    section: 'business_and_office',
  },
  {
    id: 'business_tax',
    name: 'VAT / Tax',
    section: 'business_and_office',
  },
  {
    id: 'shop_repair',
    name: 'Shop Maintenance',
    section: 'business_and_office',
  },
  {
    id: 'delivery_cost',
    name: 'Delivery / Courier',
    section: 'business_and_office',
  },
  {
    id: 'pos_software',
    name: 'POS / Bill App',
    section: 'business_and_office',
  },
  {
    id: 'notebooks',
    name: 'Notebooks / Pens',
    section: 'business_and_office',
  },
  {
    id: 'ink_toner',
    name: 'Ink / Toner',
    section: 'business_and_office',
  },
  {
    id: 'doctor',
    name: 'Doctor Visit',
    section: 'medical',
  },
  {
    id: 'medicine',
    name: 'Medicine',
    section: 'medical',
  },
  {
    id: 'diagnostic',
    name: 'Lab Test',
    section: 'medical',
  },
  {
    id: 'hospital_bill',
    name: 'Hospital Bill',
    section: 'medical',
  },
  {
    id: 'dental',
    name: 'Dental Care',
    section: 'medical',
  },
  {
    id: 'optometry',
    name: 'Glasses / Eyes',
    section: 'medical',
  },
  {
    id: 'physio',
    name: 'Physiotherapy',
    section: 'medical',
  },
  {
    id: 'scrubs',
    name: 'Scrubs / Lab Coat',
    section: 'medical',
  },
  {
    id: 'med_journal',
    name: 'Medical Journal',
    section: 'medical',
  },
  {
    id: 'stethoscope',
    name: 'Medical Equipment',
    section: 'medical',
  },
  {
    id: 'med_license',
    name: 'BMDC / License',
    section: 'medical',
  },
  {
    id: 'school_fee',
    name: 'School Fees',
    section: 'education',
  },
  {
    id: 'coaching',
    name: 'Coaching / Tuition',
    section: 'education',
  },
  {
    id: 'books',
    name: 'Books / Stationery',
    section: 'education',
  },
  {
    id: 'photocopy',
    name: 'Photocopy / Print',
    section: 'education',
  },
  {
    id: 'library',
    name: 'Library Membership',
    section: 'education',
  },
  {
    id: 'project_mat',
    name: 'Project Materials',
    section: 'education',
  },
  {
    id: 'canteen',
    name: 'Canteen / Tiffin',
    section: 'education',
  },
  {
    id: 'internship',
    name: 'Internship Cost',
    section: 'education',
  },
  {
    id: 'hostel_rent',
    name: 'Hostel / Mess',
    section: 'education',
  },
  {
    id: 'admission_fee',
    name: 'Admission Fee',
    section: 'education',
  },
  {
    id: 'exam_fee',
    name: 'Exam Fee',
    section: 'education',
  },
  {
    id: 'seeds',
    name: 'Seeds / Saplings',
    section: 'agro_and_farming',
  },
  {
    id: 'fertilizer',
    name: 'Fertilizer',
    section: 'agro_and_farming',
  },
  {
    id: 'pesticide',
    name: 'Pesticides',
    section: 'agro_and_farming',
  },
  {
    id: 'irrigation',
    name: 'Irrigation / Water',
    section: 'agro_and_farming',
  },
  {
    id: 'feed',
    name: 'Cattle/Bird Feed',
    section: 'agro_and_farming',
  },
  {
    id: 'vet_visit',
    name: 'Vet / Animal Med',
    section: 'agro_and_farming',
  },
  {
    id: 'harvest_labor',
    name: 'Harvest Labor',
    section: 'agro_and_farming',
  },
  {
    id: 'farm_tools',
    name: 'Tool Repair',
    section: 'agro_and_farming',
  },
  {
    id: 'art_supplies',
    name: 'Art Supplies',
    section: 'creative',
  },
  {
    id: 'camera_gear',
    name: 'Camera / Lens',
    section: 'creative',
  },
  {
    id: 'lighting',
    name: 'Studio Lighting',
    section: 'creative',
  },
  {
    id: 'printing_large',
    name: 'Canvas / Print',
    section: 'creative',
  },
  {
    id: 'memory_card',
    name: 'Memory Cards',
    section: 'creative',
  },
  {
    id: 'gallery_fee',
    name: 'Gallery / Exhibition',
    section: 'creative',
  },
  {
    id: 'zakat',
    name: 'Zakat Payment',
    section: 'social_and_religious',
  },
  {
    id: 'sadaqah',
    name: 'Sadaqah / Charity',
    section: 'social_and_religious',
  },
  {
    id: 'masjid_don',
    name: 'Masjid Donation',
    section: 'social_and_religious',
  },
  {
    id: 'madrasa_don',
    name: 'Madrasa Donation',
    section: 'social_and_religious',
  },
  {
    id: 'qurbani',
    name: 'Qurbani Expense',
    section: 'social_and_religious',
  },
  {
    id: 'fitra',
    name: 'Fitra',
    section: 'social_and_religious',
  },
  {
    id: 'wedding_gift',
    name: 'Wedding Gift',
    section: 'social_and_religious',
  },
  {
    id: 'birthday_gift',
    name: 'Birthday Gift',
    section: 'social_and_religious',
  },
  {
    id: 'relatives',
    name: 'Family Support',
    section: 'social_and_religious',
  },
  {
    id: 'beggar',
    name: 'Poor / Beggar',
    section: 'social_and_religious',
  },
  {
    id: 'iftar_party',
    name: 'Iftar Party',
    section: 'social_and_religious',
  },
  {
    id: 'mezbani',
    name: 'Mezbani',
    section: 'social_and_religious',
  },
  {
    id: 'recharge',
    name: 'Mobile Recharge',
    section: 'personal_and_grooming',
  },
  {
    id: 'mobile_data',
    name: 'Mobile Data',
    section: 'personal_and_grooming',
  },
  {
    id: 'clothing',
    name: 'Clothing / Dress',
    section: 'personal_and_grooming',
  },
  {
    id: 'shoes',
    name: 'Shoes / Footwear',
    section: 'personal_and_grooming',
  },
  {
    id: 'panjabi',
    name: 'Panjabi / Lungi',
    section: 'personal_and_grooming',
  },
  {
    id: 'sharee',
    name: 'Sharee / Salwar',
    section: 'personal_and_grooming',
  },
  {
    id: 'tailoring',
    name: 'Tailoring Cost',
    section: 'personal_and_grooming',
  },
  {
    id: 'saloon',
    name: 'Barber / Saloon',
    section: 'personal_and_grooming',
  },
  {
    id: 'parlor',
    name: 'Beauty Parlor',
    section: 'personal_and_grooming',
  },
  {
    id: 'shaving_kit',
    name: 'Shaving / Deodorant',
    section: 'personal_and_grooming',
  },
  {
    id: 'perfume',
    name: 'Perfume / Attar',
    section: 'personal_and_grooming',
  },
  {
    id: 'gym',
    name: 'Gym / Fitness',
    section: 'personal_and_grooming',
  },
  {
    id: 'supplements',
    name: 'Gym Supplements',
    section: 'personal_and_grooming',
  },
  {
    id: 'pet_food',
    name: 'Pet Food / Care',
    section: 'personal_and_grooming',
  },
  {
    id: 'paan',
    name: 'Paan / Supari',
    section: 'personal_and_grooming',
  },
  {
    id: 'smoking',
    name: 'Tea / Smoking',
    section: 'personal_and_grooming',
  },
  {
    id: 'bank_fee',
    name: 'Bank Fees / Tax',
    section: 'finance_and_legal',
  },
  {
    id: 'insurance',
    name: 'Insurance',
    section: 'finance_and_legal',
  },
  {
    id: 'loan_inst',
    name: 'Loan Installment',
    section: 'finance_and_legal',
  },
  {
    id: 'gold',
    name: 'Gold / Jewelry',
    section: 'finance_and_legal',
  },
  {
    id: 'legal_fee',
    name: 'Lawyer / Legal',
    section: 'finance_and_legal',
  },
  {
    id: 'police_fine',
    name: 'Police Fine',
    section: 'finance_and_legal',
  },
  {
    id: 'passport',
    name: 'Passport / Visa',
    section: 'finance_and_legal',
  },
  {
    id: 'cinema',
    name: 'Cinema / Movies',
    section: 'entertainment',
  },
  {
    id: 'games',
    name: 'Video Games',
    section: 'entertainment',
  },
  {
    id: 'steam_games',
    name: 'Steam / Epic',
    section: 'entertainment',
  },
  {
    id: 'tour',
    name: 'Travel / Tour',
    section: 'entertainment',
  },
  {
    id: 'park',
    name: 'Amusement Park',
    section: 'entertainment',
  },
  {
    id: 'streaming',
    name: 'Netflix / Spotify',
    section: 'entertainment',
  },
  {
    id: 'hobbies',
    name: 'Hobby / Sports',
    section: 'entertainment',
  },
  {
    id: 'other',
    name: 'Other Expense',
    section: 'other',
  },
];

const byId = new Map(FINANCE_CATEGORIES.map((c) => [c.id, c]));

export function categoryName(id: string | null | undefined): string | null {
  return id ? (byId.get(id)?.name ?? null) : null;
}
