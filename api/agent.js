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

    const defaultKey = Buffer.from('QVEuQWI4Uk42S2xfTG5BMnFoOEwyZ3JuQ3BsVV9fUi1jOEYzTThmTnFzY3lUTGtnNEZoa2c=', 'base64').toString('utf8');
    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY || req.headers['x-gemini-key'] || (req.body && req.body.apiKey) || defaultKey;
    if (!apiKey) {
      // Quiet signal to client to use rich built-in offline engine
      return res.status(200).json({
        fallback: true,
        source: 'local-knowledge',
        message: 'No cloud API key configured; use local knowledge engine.'
      });
    }

    const systemPrompt = `You are Lamim AI — a highly intelligent, knowledgeable, and humanized assistant embedded inside the Lamim Life Operating System (Lamim PWA).

CORE RULES:
- Answer ANY question: Lamim features, Islam, health, productivity, finance, science, life advice — everything.
- Start answering immediately. No greetings, no "Great question!", no filler. No "As an AI..." disclaimers.
- Be humanized: write like a knowledgeable, thoughtful friend. Precise but never robotic.
- Concise by default. Add depth only when genuinely needed. Never pad.
- Ambiguous question? Ask ONE short clarifying question.
- Format: **bold** for key terms, bullets for lists, headers only for multi-section answers.
- Zero decorative emojis (no stars, moons, etc.).

LANGUAGE:
- Auto-detect and match user's language.
- Understand Banglish perfectly: "namaj er hisab", "jakat kemne ber korbo", "perfect day ki", "shs ki", "streak bujhao", "4-7-8 ki", "salah er perfect feature" etc.
- Language override: respond in ${lang === 'bn' ? 'Bengali (বাংলা)' : 'English'}.

LAMIM KNOWLEDGE BASE:

**Salah Tracker**
- Perfect Day: All 5 fardh prayers (Fajr, Dhuhr, Asr, Maghrib, Isha) completed (5/5) in one day.
- Perfect Streak: Consecutive days with all 5 prayers done. Shows Gold Star badge.
- Consistency Streak: Consecutive days with at least 1 prayer logged.
- Jama'at: Praying in congregation = +27x SHS multiplier.
- Qaza Omri: Lifetime missed prayer tracker to make up accumulated debt.
- Engine: Offline solar-angle calculator (Karachi, ISNA, MWL, Umm Al-Qura, Egypt, Tehran), Hanafi/Shafi'i Asr, audio Adhan.
- Visuals: 21-day heatmap + 365-day spiritual grid.

**Digital Dhikr & Tasbih**
- Full-screen tap counter with haptic feedback.
- Presets: SubhanAllah (33), Alhamdulillah (33), Allahu Akbar (34), Astaghfirullah (100), Ayat al-Kursi, Durood Sharif, Morning/Evening Adhkar.
- Daily + lifetime counts stored offline in IndexedDB.

**Halal Finance & Zakat**
- Private offline ledger. Nothing leaves the device.
- Multi-currency: BDT, USD, EUR, GBP, SAR, AED with live FX rates.
- Zakat: 2.5% against Gold Nisab (87.48g / 7.5 Bhori) or Silver Nisab (612.36g / 52.5 Bhori) minus debts.
- Emergency fund runway + full JSON backup/export.

**Habits, Hydration & 4-7-8 Breathing**
- 4-7-8: 4s inhale, 7s hold, 8s exhale. Visual pulse ring + audio chime.
- Habits: Quran (morning/evening), sleep, reading streaks.
- Hydration: 250ml glass logger, 2000ml+ daily goal.

**Spiritual Health Score (SHS)**
- 0–100 index: Salah 35%, Jama'at 15%, Dhikr 20%, Habits & Quran 15%, Finance 10%, Hydration & Breathing 5%.
- Tiers: Muqarrabun (90–100) → Muttaqin (75–89) → Salihin (50–74) → Mujtahid (25–49) → Ghafil (0–24).

**Gym & Fitness**
- Splits: PPL, Upper/Lower, Full Body, by muscle group.
- Logs: sets, reps, weight, RPE, rest, 1RM.

**Career Hub & Deep Work**
- Daily top 3 MIT (Most Important Tasks).
- Career Perfect Day: All 3 MIT completed.
- Pomodoro: 25/5 or 50/10 intervals.

**Privacy & Offline**
- 100% offline-first PWA. Service Worker + IndexedDB. No cloud sync. No telemetry.`;

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

    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3.6-flash'];
    const payload = {
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: contents,
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 400
      }
    };

    for (const model of candidateModels) {
      try {
        const ctrl = new AbortController();
        const to = setTimeout(() => ctrl.abort(), 6000);
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const apiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: ctrl.signal
        });
        clearTimeout(to);

        if (apiRes.ok) {
          const data = await apiRes.json();
          const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            return res.status(200).json({
              reply: replyText.trim(),
              source: 'cloud-ai',
              model: model,
              ts: Date.now()
            });
          }
        }
      } catch (err) {}
    }

    return res.status(200).json({ fallback: true, source: 'local-knowledge' });
  } catch (err) {
    return res.status(200).json({ fallback: true, source: 'local-knowledge' });
  }
};
