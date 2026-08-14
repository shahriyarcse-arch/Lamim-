// Vercel Serverless Function for Live TradingView FX Rate
module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 6000);

    const tvRes = await fetch('https://scanner.tradingview.com/forex/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        symbols: { tickers: ['FX_IDC:USDBDT'] },
        columns: ['close', 'change', 'change_abs', 'high', 'low']
      }),
      signal: ctrl.signal
    });
    clearTimeout(to);

    if (tvRes.ok) {
      const data = await tvRes.json();
      if (data && data.data && data.data[0] && Array.isArray(data.data[0].d)) {
        const d = data.data[0].d;
        const rate = d[0];
        const changePct = d[1];
        const changeAbs = d[2];

        if (typeof rate === 'number' && isFinite(rate) && rate > 0) {
          return res.status(200).json({
            source: 'TradingView',
            rate: rate,
            changePct: typeof changePct === 'number' ? changePct : null,
            changeAbs: typeof changeAbs === 'number' ? changeAbs : null,
            ts: Date.now()
          });
        }
      }
    }
  } catch (err) {
    // Failover silently to OpenER API
  }

  // Failover to OpenER
  try {
    const backupRes = await fetch('https://open.er-api.com/v6/latest/USD');
    const backupData = await backupRes.json();
    if (backupData && backupData.rates && backupData.rates.BDT) {
      return res.status(200).json({
        source: 'OpenER',
        rate: backupData.rates.BDT,
        ts: Date.now()
      });
    }
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch forex rates' });
  }
};
