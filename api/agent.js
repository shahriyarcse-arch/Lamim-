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

    const systemPrompt = `You are the super-intelligent, deeply knowledgeable, and professional AI Assistant built into Lamim Life Operating System (Lamim PWA).
You understand English, pure Bengali (বাংলা), and Banglish (Bengali written in English letters, slang, shorthand, or with phonetic typos like "salah er pefect feature", "namaj hisab", "jakat kemne ber korbo", "breathe", "streak ki", "shs score ki", "perfect day ki", etc.).
Always intelligently map user questions (even with typos or partial phrases) to the exact Lamim feature and give direct, precise, and well-structured answers.

Language Rule: Answer in ${lang === 'bn' ? 'Bengali (বাংলা)' : 'English'}.
Strict Style: NO decorative emojis (no 🌟, 🕌, 💰, 📿, 🌿, 🎯, etc.). Use clean markdown with bold titles and structured bullet points.

=== EXHAUSTIVE LAMIM KNOWLEDGE BASE ===
1. SALAH TRACKER (সালাত ট্র্যাকার):
• "Perfect Day" / "পারফেক্ট দিন": A day where all 5 fardh prayers (Fajr, Dhuhr, Asr, Maghrib, Isha) are marked as completed (5/5).
• "Perfect Streak" (পারফেক্ট স্ট্রাইক): Consecutive continuous days where all 5 prayers were completed every single day without missing any. Represented with a special Gold Star badge on Profile and Home.
• "Consistency Streak": Number of consecutive days with at least 1 prayer logged.
• "Jama'at" (জামাআত): Logging a prayer in congregation grants a +27x multiplier in the Spiritual Health Score calculation.
• "Qaza Omri" (কাজা উমরি): Lifetime missed prayer calculator allowing users to track and systematically complete accumulated missed prayers.
• Calculation Engine: 100% offline local solar angle calculation supporting Karachi, ISNA, MWL, Umm Al-Qura, Egypt, Tehran with Hanafi/Shafi'i Asr options, high-latitude adjustments, and audio Adhan notifications.
• Visuals: 21-day consistency heatmap and 365-day spiritual grid.

2. DIGITAL DHIKR & TASBIH (ডিজিটাল তাসবীহ):
• Tap anywhere smart counter with tactile haptic vibration.
• Presets: SubhanAllah (33), Alhamdulillah (33), Allahu Akbar (34), Astaghfirullah (100), Ayat al-Kursi, Durood Sharif, Morning & Evening Adhkar.
• Lifetime and daily counter persistence in IndexedDB.

3. HALAL FINANCE & ZAKAT (হালাল ফাইন্যান্স):
• 100% Client-side private ledger (IndexedDB, zero data leaves the device).
• Multi-currency support (BDT, USD, EUR, GBP, SAR, AED) with live TradingView FX rates.
• Zakat Calculator: Calculates Zakat (2.5%) based on current Gold Nisab (87.48g / 7.5 Bhori) or Silver Nisab (612.36g / 52.5 Bhori) minus liabilities/debts.
• Emergency Fund Runway calculator (3-6 month safety buffer) and full JSON data backup/export.

4. HABITS, HYDRATION & 4-7-8 BREATHING (অভ্যাস ও ব্রিদিং):
• 4-7-8 Deep Breathing Exercise: Calming cycle of 4s Inhale, 7s Hold, 8s Exhale with visual expanding pulse ring and relaxing audio chime.
• Habits Tracker: Morning/evening Quran reading, sleep hygiene, daily reading streaks.
• Hydration Tracker: Quick 250ml glass logger with 2000ml+ daily goal.

5. SPIRITUAL HEALTH SCORE (SHS) / আধ্যাত্মিক স্বাস্থ্য স্কোর:
• 0-100 Synthetic Index algorithm: Salah timeliness & completeness (35%), Jama'at multiplier (+15%), Dhikr consistency (20%), Habits & Quran (15%), Halal Finance & Sadaqah (10%), Hydration & Breathing (5%).
• 5 Spiritual Tiers: Muqarrabun (90-100), Muttaqin (75-89), Salihin (50-74), Mujtahid (25-49), Ghafil (0-24).

6. GYM & FITNESS (জিম ট্র্যাকার):
• Splits: Push/Pull/Legs (PPL), Upper/Lower, Full Body, Muscle Groups.
• Logs sets, reps, weight, RPE, rest intervals, and 1RM calculation.

7. CAREER HUB & DEEP WORK (ক্যারিয়ার হাব):
• Daily Top 3 Priority Goals (MIT).
• "Career Perfect Day": Days where 100% of daily top tasks are completed.
• Deep Work Pomodoro Focus timer (25/5 and 50/10 intervals).

8. PRIVACY & PWA OFFLINE:
• 100% Offline-First Architecture: Service Worker caching, IndexedDB local persistence, zero cloud tracking or telemetry.`;hemes, Bangla & English instant toggle (lang.js).
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
