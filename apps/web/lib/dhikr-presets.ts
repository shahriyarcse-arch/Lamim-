// Generated from legacy/app/js. Arabic and Bengali text are the legacy app’s own data.
// Preset ids MUST stay identical to legacy ids: imported dhikr counts are keyed by them.

export interface DhikrPreset {
  id: string;
  arabic: string;
  latin: string;
  bn: string;
  meaning: string;
  meaningBn: string;
  /** Milestone size for the progress ring. */
  target: number;
  custom?: boolean;
}

export const BUILT_IN_PRESETS: readonly DhikrPreset[] = [
  {
    id: 'subhanallah',
    arabic: 'سُبْحَانَ اللَّهِ',
    latin: 'SubhanAllah',
    bn: 'সুবহানাল্লাহ',
    meaning: 'Glory be to Allah',
    meaningBn: 'আল্লাহর পবিত্রতা ঘোষণা',
    target: 33,
  },
  {
    id: 'alhamdulillah',
    arabic: 'الْحَمْدُ لِلَّهِ',
    latin: 'Alhamdulillah',
    bn: 'আলহামদুলিল্লাহ',
    meaning: 'All praise is due to Allah',
    meaningBn: 'সকল প্রশংসা মহান আল্লাহর জন্য',
    target: 33,
  },
  {
    id: 'allhuakbar',
    arabic: 'اللَّهُ أَكْبَرُ',
    latin: 'Allahu Akbar',
    bn: 'আল্লাহু আকবার',
    meaning: 'Allah is the Greatest',
    meaningBn: 'আল্লাহ সর্বশ্রেষ্ঠ',
    target: 33,
  },
  {
    id: 'la-ilaha',
    arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ',
    latin: 'La ilaha illallah',
    bn: 'লা ইলাহা ইল্লাল্লাহ',
    meaning: 'There is no god but Allah',
    meaningBn: 'আল্লাহ ছাড়া কোনো উপাস্য নেই',
    target: 33,
  },
  {
    id: 'astghfirullah',
    arabic: 'أَسْتَغْفِرُ اللَّهَ',
    latin: 'Astaghfirullah',
    bn: 'আস্তাগফিরুল্লাহ',
    meaning: 'I seek forgiveness of Allah',
    meaningBn: 'আল্লাহর কাছে ক্ষমা প্রার্থনা',
    target: 33,
  },
  {
    id: 'salawat',
    arabic: 'صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ',
    latin: 'Allahumma Salli',
    bn: 'আল্লাহুম্মা সাল্লি',
    meaning: 'Prayers upon the Prophet',
    meaningBn: 'নবীজির (সা.) ওপর দরূদ',
    target: 33,
  },
  {
    id: 'hasbunallah',
    arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
    latin: 'Hasbunallah',
    bn: 'হাসবুনাল্লাহ',
    meaning: 'Allah is Sufficient for us',
    meaningBn: 'আমাদের জন্য আল্লাহই যথেষ্ট',
    target: 33,
  },
  {
    id: 'ya-hayyu',
    arabic: 'يَا حَيُّ يَا قَيُّومُ',
    latin: 'Ya Hayyu Ya Qayyum',
    bn: 'ইয়া হাইয়্যু ইয়া কাইয়্যূম',
    meaning: 'O Ever-Living, O Sustainer',
    meaningBn: 'হে চিরঞ্জীব, হে চিরস্থায়ী',
    target: 33,
  },
  {
    id: 'subhanallahi-wabihamdihi',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    latin: 'SubhanAllahi Wabihamdihi',
    bn: 'সুবহানাল্লাহি ওয়া বিহামদিহি',
    meaning: 'Glory and praise be to Allah',
    meaningBn: 'আল্লাহর পবিত্রতা ও প্রশংসা',
    target: 33,
  },
  {
    id: 'la-hawla',
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    latin: 'La Hawla Wala Quwwata',
    bn: 'লা হাওলা ওয়ালা কুওয়াতা',
    meaning: 'There is no power except with Allah',
    meaningBn: 'আল্লাহর সাহায্য ছাড়া কোনো শক্তি নেই',
    target: 33,
  },
];
