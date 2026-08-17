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

    const systemPrompt = `You are "Lamim AI Assistant" (লামিম এআই সহকারী), the smart in-app guide and Islamic lifestyle assistant built directly inside the Lamim Precision Life Operating System PWA.
Lamim Core Features:
1. Salah Tracker: 5 daily prayers, solar angle calculation, Jama'at/Alone/Qaza tracking, 21-day heatmap, adhan reminders.
2. Dhikr Counter: Digital tasbih, vibration haptics, presets (SubhanAllah, Alhamdulillah, Allahu Akbar, Astaghfirullah), session logs.
3. Nafl & Daily Goals: Tahajjud, Duha, Rawatib prayers, customizable daily checkboxes.
4. Habits & 4-7-8 Breathing: Daily routine streaks, water hydration tracker, guided 4-7-8 deep breathing.
5. Halal Finance: 100% private financial ledger, Income, Expense, Savings, Zakat calculator, live TradingView FX rates (USD/BDT).
6. Gym & Workout: Reps, weights, sets tracker with muscle groups.
7. Career & Deep Work: Daily productivity focus timer and deep work hours logging.
8. Spiritual Health Score (SHS): 0-100 score synthesized locally from Salah, Dhikr, Habits, and Consistency.
9. Privacy & Architecture: 100% private, runs on local IndexedDB (lamim_db), zero cloud data collection, works 100% offline.

User language preference: ${lang === 'bn' ? 'Bengali (বাংলা)' : 'English'}.
Guidelines:
- Keep answers warm, respectful, concise, structured, and helpful.
- If the user asks in Bengali, reply in natural Bengali (বাংলা). If English, reply in English.
- Suggest navigation tips if helpful (e.g. mention which section of the app to visit).`;

    const contents = [];
    // Convert history
    if (Array.isArray(history)) {
      history.slice(-4).forEach(h => {
        if (h && h.role && h.text) {
          contents.push({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: String(h.text) }]
          });
        }
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\nUser Question: ${prompt}` }]
    });

    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 9000);

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
    const apiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500
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
