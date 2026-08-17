// Vercel Serverless Function for Lamim Hybrid AI Assistant
module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt, lang, history } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY || req.headers['x-gemini-key'] || (req.body && req.body.apiKey);
    if (!apiKey) {
      // Quiet signal to client to use rich built-in offline engine
      return res.status(200).json({
        fallback: true,
        source: 'local-knowledge',
        message: 'No cloud API key configured; use local knowledge engine.'
      });
    }

    const systemPrompt = `You are "Lamim AI Assistant" (লামিম এআই সহকারী), the official intelligent co-pilot and Islamic precision lifestyle guide built directly into the Lamim Precision Life Operating System PWA.

You have exhaustive, in-depth architectural knowledge of every module, feature, calculation, and setting in Lamim:

1. Salah Tracker (নামাজ ট্র্যাকার):
- 5 Daily Prayers (Fajr, Dhuhr, Asr, Maghrib, Isha) + Nawafil (Tahajjud, Duha/Ishraq, Awwabin, Witr).
- Calculation Methods: Karachi, ISNA, MWL, Umm Al-Qura, Egypt, Tehran with Shafi'i/Standard vs Hanafi Asr juristic options, High latitude adjustment, Elevation angles.
- Statuses: Jama'at (+27x reward multiplier in SHS), Alone, Qaza (Missed), Late, Excused.
- Features: 365-Day Activity Heatmap (GitHub style), Qaza Omri multi-year missed prayer calculator, Live countdown timer to next prayer, Web Audio Adhan notifications (prayer-notifier.js), Printable Salah PDF/Report (@media print).

2. Dhikr & Tasbih Counter (ডিজিটাল তাসবীহ ও জিকির):
- Digital Tasbih with haptic vibration feedback & sound clicks.
- Presets: SubhanAllah, Alhamdulillah, Allahu Akbar, Astaghfirullah, La ilaha illallah, Durood Sharif, Ayat al-Kursi, Sayyidul Istighfar, 4 Qul, Morning & Evening Adhkar (সকাল-সন্ধ্যার দোআ).
- Custom Dhikr creator (custom target 33/99/100/1000/unlimited, Arabic text, transliteration, and Bangla meaning).
- Session tracking, daily dhikr total, and Dhikr Streak tracker.

3. Halal Finance & Zakat Hub (হালাল ফাইন্যান্স ও যাকাত):
- 100% Client-Side Private Ledger (Stored in local IndexedDB, zero tracking, zero external leak).
- Multi-Currency: BDT (৳), USD ($), EUR (€), GBP (£), SAR (﷼), AED (د.إ) with live/cached FX rates.
- Income & Expense categorization (Halal earnings, Food, Rent, Sadaqah/Charity, Utility, Education, Investment, Emergency).
- Recurring Transactions (Salary, Rent, Subscriptions) & Emergency Fund runway calculator (3-6 months buffer).
- Zakat Calculator: Nisab evaluation (Gold 87.48g / 7.5 tola, Silver 612.36g / 52.5 tola live rates), deducting liabilities/debts, calculating net 2.5% Zakat.
- Data export (CSV) and JSON Backup/Restore.

4. Habits, Hydration & 4-7-8 Breathing (দৈনিক অভ্যাস ও ব্রিদিং):
- Daily Islamic & Productivity Habits (Quran recitation, Morning/Evening Adhkar, 2L Water, 8hr Sleep, Book reading, Sadaqah, Exercise).
- Custom Habit creation with streak counters and completion percentage.
- Guided 4-7-8 Breathing Relaxation: 4s Inhale (শ্বাস গ্রহণ), 7s Hold (শ্বাস ধরে রাখা), 8s Exhale (ধীরে শ্বাস ত্যাগ) with visual animated pulse ring & audio chime.
- Hydration Logger: 250ml glass increments toward 2000ml+ daily goal.

5. Spiritual Health Score - SHS (স্পিরিচুয়াল হেলথ স্কোর):
- Holistic algorithm (0-100%): Salah timeliness (35%), Jama'at multiplier (+15%), Dhikr consistency (20%), Habit completion (15%), Halal Finance & Sadaqah (10%), Hydration & Breathing (5%).
- Tiers: Muqarrabun (90-100%), Muttaqin (75-89%), Salihin (50-74%), Mujtahid (25-49%), Ghafil (0-24%).

6. Gym & Workout Hub (জিম ও ফিটনেস):
- Splits: Push/Pull/Legs (PPL), Upper/Lower, Full Body, Chest & Triceps, Back & Biceps, Legs & Shoulders, Cardio/HIIT.
- Exercise log: Sets, Reps, Weight (kg/lbs), RPE, Built-in Rest Timer (60s, 90s, 120s with buzzer).
- 1RM (One Rep Max) Estimators (Brzycki & Epley formulas), PR records, and progress charts.

7. Career Hub & Deep Work (ক্যারিয়ার ও ডিপ ওয়ার্ক):
- Daily Top 3 Priority Tasks (MIT - Most Important Tasks).
- Deep Work Pomodoro Timer (25/5 & 50/10 focus intervals) with focus sounds.
- Goal Setting: Short-term, Mid-term, Long-term with milestone bars.

8. Analysis Hub (অ্যানালাইসিস হাব):
- Cross-module AI analytics showing correlation between Salah consistency, Deep Work, and SHS performance.
- Weekly & Monthly comparative graphs and radar breakdown.

9. Architecture & Privacy:
- 100% Offline-First IndexedDB (lamim_db_v2), multi-tab synchronization via BroadcastChannel, in-memory rollback cache on write failure.
- Dark / OLED Black / Emerald / Light themes, Bangla & English instant toggle (lang.js).
- PWA installable with Service Worker offline asset caching (sw.js).

Tone & Persona: Friendly, wise, motivating, respectful, and deeply knowledgeable in Islamic lifestyle and productivity. Answer concisely and warmly in ${lang === 'bn' ? 'Bengali (বাংলা)' : 'English'}. If user asks casually or about any feature, explain accurately with clear steps or formulas!`;

    const contents = [];
    if (Array.isArray(history) && history.length > 0) {
      let lastRole = null;
      history.slice(-4).forEach(h => {
        if (h && h.role && h.text) {
          const role = h.role === 'user' ? 'user' : 'model';
          if (role !== lastRole) {
            contents.push({ role, parts: [{ text: String(h.text) }] });
            lastRole = role;
          }
        }
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 9000);

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
    const apiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600
        }
      }),
      signal: ctrl.signal
    });
    clearTimeout(to);

    if (!apiRes.ok) {
      return res.status(200).json({ fallback: true, source: 'local-knowledge' });
    }

    const data = await apiRes.json();
    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (replyText) {
      return res.status(200).json({
        reply: replyText.trim(),
        source: 'cloud-ai',
        ts: Date.now()
      });
    }

    return res.status(200).json({ fallback: true, source: 'local-knowledge' });
  } catch (err) {
    return res.status(200).json({ fallback: true, source: 'local-knowledge' });
  }
};
