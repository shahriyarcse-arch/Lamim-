import mod from 'file:///C:/Users/ASUS/AppData/Roaming/npm/node_modules/omniroute/node_modules/playwright/index.mjs';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { chromium } = mod;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.json': 'application/json'
};

const server = http.createServer((req, res) => {
  let filePath = path.join(rootDir, req.url === '/' ? 'app/index.html' : req.url.split('?')[0]);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  const ext = path.extname(filePath).toLowerCase();
  fs.readFile(filePath, (err, content) => {
    if (err) { res.writeHead(404); res.end('Not found'); }
    else { res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/html' }); res.end(content); }
  });
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

await page.goto(`http://127.0.0.1:${port}/app/index.html`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

const testResults = await page.evaluate(async () => {
  const results = {};
  const today = new Date().toISOString().split('T')[0];

  // 1. DB Init check
  results.dbInitialized = typeof DB !== 'undefined' && DB._db !== null;

  // 2. User profile read/write
  DB.setUser({ name: 'Realtime Seeker', gender: 'male', spirit_score: 100 });
  const u = DB.getUser();
  results.userRead = u !== null && u.name === 'Realtime Seeker';

  // 3. Dhikr CRUD test
  const initialDhikr = DB.getDhikr(today);
  const testCount = (initialDhikr?.subhanallah || 0) + 5;
  DB.setDhikr(today, { ...initialDhikr, subhanallah: testCount });
  const updatedDhikr = DB.getDhikr(today);
  results.dhikrCrud = updatedDhikr.subhanallah === testCount;

  // 4. Salah Save/Update test
  const testSalah = { fajr: 'jamaat', dhuhr: 'solo', asr: 'solo', maghrib: 'jamaat', isha: 'none', tahajjud: false, jummah: false, notes: {} };
  DB.setSalah(today, testSalah);
  const savedSalah = DB.getSalah(today);
  results.salahCrud = savedSalah && savedSalah.fajr === 'jamaat' && savedSalah.isha === 'none';

  // 5. Goals Add/Update/Remove test
  const goalId = 'test_goal_' + Date.now();
  DB.addGoal({ id: goalId, text: 'Realtime Audit Goal', category: 'spiritual', completed: false });
  const goalsWithNew = DB.getGoals();
  const hasGoal = goalsWithNew.some(g => g.id === goalId);
  const remainingGoals = goalsWithNew.filter(g => g.id !== goalId);
  DB.setGoals(remainingGoals);
  const goalsAfterRemove = DB.getGoals();
  const removedGoal = !goalsAfterRemove.some(g => g.id === goalId);
  results.goalsCrud = hasGoal && removedGoal;

  // 6. Gym Set/Get test
  const testGym = DB.getGym(today);
  testGym.water.amount = 1500;
  DB.setGym(today, testGym);
  const savedGym = DB.getGym(today);
  results.gymCrud = savedGym && savedGym.water.amount === 1500;

  // 7. Career Set/Get test
  const testCareer = DB.getCareer(today);
  testCareer.studyDuration = 45;
  DB.setCareer(today, testCareer);
  const savedCareer = DB.getCareer(today);
  results.careerCrud = savedCareer && savedCareer.studyDuration === 45;

  return results;
});

console.log('REALTIME CRUD AUDIT RESULTS:', JSON.stringify(testResults, null, 2));

await browser.close();
server.close();
