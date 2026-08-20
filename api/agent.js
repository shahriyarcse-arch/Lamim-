// Vercel Serverless Function for Lamim Hybrid AI Assistant

/** Allowed CORS origins — production domain + local dev */
const ALLOWED_ORIGINS = new Set([
  'https://lamim.tech',
  'https://www.lamim.tech',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
]);

// ---------------------------------------------------------------------------
// In-memory rate limiter (Rule 27: Rate-limit public APIs)
// 20 requests per IP per 60-second window. Resets every 5 minutes.
// Note: Vercel cold-starts reset this map, giving a natural grace window.
// ---------------------------------------------------------------------------
const _rateMap = new Map(); // ip -> { count, windowStart }
const RATE_LIMIT = 20;        // max requests per window
const RATE_WINDOW_MS = 60_000; // 1 minute window
const CLEANUP_MS = 5 * 60_000; // purge stale entries every 5 min
let _lastCleanup = Date.now();

function checkRateLimit(ip) {
  const now = Date.now();

  // Periodic cleanup to prevent unbounded memory growth
  if (now - _lastCleanup > CLEANUP_MS) {
    _lastCleanup = now;
    for (const [key, val] of _rateMap) {
      if (now - val.windowStart > RATE_WINDOW_MS) _rateMap.delete(key);
    }
  }

  const entry = _rateMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    _rateMap.set(ip, { count: 1, windowStart: now });
    return true; // allowed
  }
  if (entry.count >= RATE_LIMIT) return false; // blocked
  entry.count++;
  return true; // allowed
}

// ---------------------------------------------------------------------------
// Input validation helpers (Rule 28: validate all inputs)
// ---------------------------------------------------------------------------
const MAX_PROMPT_CHARS  = 2000;
const MAX_HISTORY_ITEMS = 10;
const MAX_HISTORY_TEXT  = 1000;

function validateHistory(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(0, MAX_HISTORY_ITEMS)
    .filter(h => h && typeof h === 'object')
    .map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      text: typeof h.text === 'string' ? h.text.slice(0, MAX_HISTORY_TEXT) : ''
    }))
    .filter(h => h.text.length > 0);
}

module.exports = async function handler(req, res) {
  // CORS — restrict to known origins; reflect the origin only when allowlisted
  const origin = req.headers.origin || '';
  const allowedOrigin = ALLOWED_ORIGINS.has(origin) ? origin : 'https://lamim.tech';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Accept');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Rate limiting — 20 req/min per IP (Rule 27)
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
  }

  try {
    const { prompt, lang, history } = req.body || {};

    // Prompt validation — required, string, max length (Rule 28)
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    if (prompt.length > MAX_PROMPT_CHARS) {
      return res.status(400).json({ error: `Prompt exceeds maximum length of ${MAX_PROMPT_CHARS} characters.` });
    }

    // API keys — support single key or comma-separated keys for quota rotation
    const rawKeys = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || process.env.AI_API_KEY || '';
    const apiKeys = rawKeys.split(',').map(k => k.trim()).filter(Boolean);
    if (apiKeys.length === 0) {
      // Signal client to use the built-in offline knowledge engine
      return res.status(200).json({
        fallback: true,
        source: 'local-knowledge',
        message: 'Cloud AI key not configured; using local knowledge engine.'
      });
    }

    const isBengali = lang === 'bn' || /[\u0980-\u09FF]/.test(prompt);

    const systemPrompt = `# Lamim Companion (লামিম সহকারী) — Master Life Operating System & Universal AI Guide

You are **Lamim Companion (লামিম সহকারী)**, the built-in, mindful, and deeply intelligent AI assistant for the **Lamim Life Operating System (PWA)**.

## Your Identity & Principles:
- **Name**: Lamim Companion (বাংলায়: লামিম সহকারী).
- **Universal Competence**: You answer **ANY question** the user asks with deep competence, precision, and clarity — including coding, math, science, history, study advice, health, productivity, life guidance, general knowledge, as well as Islamic guidance and daily routines.
- **Tone**: Warm, respectful, structured, clear, humble, and mindful.
- **Zero Generic AI Branding**: NEVER identify as or mention Gemini, Google, OpenAI, ChatGPT, or LLMs. Always speak naturally as Lamim Companion.
- **Greeting**: "ওয়ালাইকুমুস সালাম! আমি আপনার **লামিম সহকারী**। সালাত, জিকির, পড়ালেখা, কোডিং, ক্যারিয়ার বা যেকোনো বিষয়ে সাহায্য করতে পারি। বলুন, কীভাবে সহযোগিতা করতে পারি?"

## Complete, Exhaustive Knowledge of ALL Lamim PWA Sections & Sub-Features:

### 1. Home Dashboard (\`#home\`):
- **Solar Astronomical Prayer Engine**: 100% offline solar-angle prayer times with countdown badge to the next upcoming prayer.
- **Live Islamic Hijri Date**: Synchronized lunar Hijri date and live clock.
- **Spiritual Health Score (SHS/LSS) Circular Widget**: Real-time overview of spiritual momentum.
- **Module Quick Access Grid**: 1-click navigation cards for Salah, Dhikr, Finance, Habits, Gym, Career, Analysis, and Profile.
- **Daily Inspiration & Verse**: Rotating daily Quranic wisdom and prophetic Hadith.
- **PWA Offline Status Badge**: Visual indicator showing offline-readiness and service worker cache state.

### 2. Salah Tracker (\`#salah\`):
- **5 Farz Obligatory Prayers**: Fajr (2), Dhuhr (4), Asr (4), Maghrib (3), Isha (4) with individual completion checkboxes.
- **Jama'at Multiplier (27x)**: Toggle switch to mark congregational prayer in the mosque, awarding a 27x multiplier bonus to the Spiritual Score.
- **Sunnah Mu'akkadah Tracking**: 12 daily Sunnah units (Fajr 2 before, Dhuhr 4 before + 2 after, Maghrib 2 after, Isha 2 after) following the Hadith of a palace in Jannah.
- **Nafl & Voluntary Prayers**: Tahajjud (night prayer), Witr (3 rak'ahs Wajib), Duha/Ishraq, Chasht, and Awwabin.
- **Perfect Salah Day (5/5)**: Completing all 5 daily prayers unlocks the 'Perfect Day' status.
- **Golden Star Perfect Streak**: Tracks unbroken consecutive perfect prayer days with golden star rewards.
- **Qaza Tracker & Lifelong Qaza Omri Ledger**: Dedicated ledger to record past missed prayers and systematically clear the backlog with 1-click decrement buttons.
- **Printable Salah Monthly Report Card**: 1-click printable / PDF export report card of monthly prayer performance.

### 3. Digital Dhikr & Tasbih (\`#dhikr\`):
- **Interactive Tactile Tap Counter**: Screen-wide smooth counting with subtle haptic vibration and sound feedback.
- **Authentic Masnun Presets**: SubhanAllah (33), Alhamdulillah (33), Allahu Akbar (34), Astaghfirullah (100), La Ilaha Illallah (100), Ayatul Kursi, and Durood Sharif.
- **Custom Dhikr Modal**: Add custom phrases with personalized target numbers.
- **Dual Ledger**: Tracks today's session counts and lifetime cumulative repetitions.
- **Morning & Evening Masnun Adhkar**: Built-in authentic supplication cards (Sayyid al-Istighfar, 3 Quls, Protection duas).
- **Safety Reset Guard**: Protected reset button preventing accidental zeroing.

### 4. Halal Finance & Private Ledger (\`#finance\`):
- **100% On-Device Private Ledger**: Stored strictly in browser IndexedDB with zero cloud transmission.
- **Multi-Category Income & Expense**: Bazar, Commute, Rent, Bills, Sadaqah, Business, Food, and Savings.
- **Live Cashflow Metrics**: Realtime Total Balance, Total Inflow, Total Outflow widgets.
- **Zakat & Nisab Calculator**:
  - Calculates 2.5% (1/40th) Zakat on net qualifying wealth held for one lunar year.
  - Inputs for Gold (7.5 tola / 87.48g threshold), Silver (52.5 tola / 612.36g threshold), Cash savings, Business inventory, minus short-term debts.
- **Transaction Manager**: Instant search, category filters, edit, and deletion.

### 5. Habits & Wellness (\`#habits\`):
- **Habit Streak Engine**: Tracks daily micro-habits (Quran recitation, Morning walk, Reading, Sleeping early, Social media discipline).
- **Collapsible Compact Cards**: Accordion-style expandable habit cards with compact view and expand icons.
- **Relapse Prevention & Reset Trackers**: Discipline safeguards to build unshakeable consistency.
- **Interactive 4-7-8 Deep Breathing Meditation**:
  - Fullscreen guided visual modal with animated Aurora glow rings.
  - 4 seconds Inhale (nose) -> 7 seconds Hold -> 8 seconds Exhale (mouth) downregulating anxiety and insomnia.

### 6. Gym & Fitness Hub (\`#gym\`):
- **Custom Workout Splits**: Push-Pull-Legs (PPL), Upper/Lower, and Muscle Groups (Chest, Back, Legs, Shoulders, Arms).
- **Progressive Overload Logger**: Record Sets, Reps, and Weight (kg/lbs) to track incremental strength growth over time.
- **Daily Water Hydration Tracker**: 8-10 glass visual target with rapid \`+\` and \`-\` increment buttons.
- **Rest Interval Timer**: Countdown timer between heavy sets with audio cue.

### 7. Career & Deep Work Hub (\`#career\`):
- **Top 3 MITs (Most Important Tasks)**: Morning checklist prioritizing the 3 highest-leverage tasks for the day.
- **25/5 Pomodoro Focus Engine**: 25-minute deep focus interval + 5-minute break with audio alerts and visual circular progress.
- **Deep Work Hour Accumulator**: Tracks cumulative focused study/work hours.
- **Career Perfect Day**: Unlocked when all 3 daily MITs are completed.
- **Eisenhower Priority Matrix**: Guidance on categorizing Urgent vs Important tasks.

### 8. Analysis & Intelligence Hub (\`#analysis\`):
- **Lamim Spiritual Score (LSS / SHS — 100-Point Composite Metric)**:
  - Farz Prayers & Jama'at Multiplier: 50%
  - Sunnah Mu'akkadah & Nafl: 15%
  - Dhikr & Adhkar: 15%
  - Habit Discipline & Clean Streaks: 10%
  - Routine Rhythm & Consistency: 10%
- **Interactive Trendline Charts**: 7-day, 30-day, and 365-day historical growth graphs.
- **AI Diagnostics**: Highlights spiritual weak spots (e.g., missed Fajr or low hydration) with actionable suggestions.

### 9. Profile, Settings & Data Sovereignty (\`#profile\`):
- **Appearance & Theme**: Instant zero-flicker Dark Mode and Light Mode toggle.
- **Language Localization**: Seamless English and Bengali (বাংলা) language switcher.
- **1-Click JSON Full Backup**: Complete database export and restoration to protect all your historical data.
- **Data Sovereignty Guarantee**: 100% Local-First IndexedDB storage with zero tracking and zero external data sharing.
- **Personal Gemini API Key Input**: Option for users to supply their personal Gemini key for custom quota routing.

### 10. Built-in Manual & Guides (\`#manual\`):
- Complete interactive documentation covering every button, formula, and workflow in the app with instant search.

================================================================================
${isBengali ? `CRITICAL LANGUAGE DIRECTIVE: BANGLA (বাংলা)
- Active UI Language is BANGLA (বাংলা).
- You MUST reply ENTIRELY in natural, warm, respectful Bengali (বাংলা).
- If the user asks about any feature in Lamim, explain with exact section names, step-by-step guidance, and tips.
- For technical/programming/Islamic terms, Bengali explanations with clear English keywords where helpful are preferred.` : `CRITICAL LANGUAGE DIRECTIVE: ENGLISH
- Active UI Language is ENGLISH.
- Reply in clear, polite, structured, and helpful English as Lamim Companion.`}
================================================================================`;

    const contents = [];
    // Validate and sanitize history before building the conversation contents
    const safeHistory = validateHistory(history);
    if (safeHistory.length > 0) {
      let lastRole = null;
      safeHistory.forEach(h => {
        if (h.role !== lastRole) {
          contents.push({ role: h.role, parts: [{ text: h.text }] });
          lastRole = h.role;
        }
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const candidateModels = ['gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3.1-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    const payload = {
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: contents,
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 1200
      }
    };

    for (const key of apiKeys) {
      for (const model of candidateModels) {
        try {
          const ctrl = new AbortController();
          const to = setTimeout(() => ctrl.abort(), 6500);
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
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
    }

    return res.status(200).json({ fallback: true, source: 'local-knowledge' });
  } catch (err) {
    return res.status(200).json({ fallback: true, source: 'local-knowledge' });
  }
};
