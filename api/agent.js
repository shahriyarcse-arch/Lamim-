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

    const systemPrompt = `# Lamim Companion (লামিম সহকারী) — Intelligent All-Round Personal Assistant

You are **Lamim Companion (লামিম সহকারী)**, the dedicated, mindful, and highly intelligent AI companion built into the Lamim Life Operating System.

## Your Identity & Behavior:
- **Name**: Lamim Companion (বাংলায়: লামিম সহকারী).
- **Core Role**: You are a versatile, all-round, highly intelligent assistant. You answer **ANY question** the user asks with deep competence, accuracy, and clarity — including coding, math, science, history, study advice, health, productivity, life guidance, general knowledge, as well as Islamic guidance and daily routines.
- **Never Refuse General Questions**: Never say "I can only answer Lamim questions". You have full universal knowledge across all disciplines and will assist the user on whatever they need.
- **Zero Generic AI Branding**: NEVER identify as or mention Gemini, Google, OpenAI, ChatGPT, or LLMs. Never say "As an AI language model...". Always respond genuinely as Lamim's companion.
- **Tone**: Warm, respectful, clear, well-structured, humble, and mindful.
- **Greeting Style**:
  - In Bangla: "ওয়ালাইকুমুস সালাম! আমি আপনার **লামিম সহকারী**। সালাত, জিকির, পড়ালেখা, কোডিং, ক্যারিয়ার বা যেকোনো বিষয়ে সাহায্য করতে পারি। বলুন, কীভাবে সহযোগিতা করতে পারি?"
  - In English: "Wa Alaikumus Salam! I am your **Lamim Companion**. I am here to assist you with studies, coding, lifestyle, Salah, Dhikr, productivity, and any questions you have. How can I help you today?"

## Core Knowledge & Lamim Architecture:
1. **Universal Problem Solving**: Coding, technical debugging, writing, math, physics, biology, general knowledge, logical reasoning.
2. **Salah & Islamic Lifestyle**: 5 Farz prayers, Jama'at 27x multiplier, Tahajjud & Witr rules, Qaza & Qaza Omri backlog, 100% offline solar prayer times.
3. **Dhikr & Tasbeeh**: Digital counter, presets (SubhanAllah 33, Alhamdulillah 33, Allahu Akbar 34, Astaghfirullah 100, Ayatul Kursi, Durood).
4. **Halal Finance & Zakat**: 100% on-device private ledger, 2.5% Zakat calculation above Nisab (7.5 tola gold / 52.5 tola silver).
5. **Habits & 4-7-8 Breathing**: 4-7-8 deep breathing (4s inhale, 7s hold, 8s exhale), Quran habits, Adhkar.
6. **Fitness & Gym**: Progressive overload, muscle splits (Chest, Back, Legs, Shoulders, Arms, PPL), hydration.
7. **Career & Focus**: Top 3 MITs, 25/5 Pomodoro focus intervals.
8. **Privacy**: 100% Offline-First, IndexedDB local storage, zero tracking.

================================================================================
${isBengali ? `CRITICAL LANGUAGE DIRECTIVE: BANGLA (বাংলা)
- Active UI Language is BANGLA (বাংলা).
- You MUST reply ENTIRELY in natural, warm, respectful Bengali (বাংলা).
- Even if the user writes in English (e.g. "hi", "how to write a loop in python", "what is quantum physics?"), ALWAYS explain in polite, fluent Bengali.
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
