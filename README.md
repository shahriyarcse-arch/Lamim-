# 🌿 Lamim — One Day, Held With Intention

[![PWA Ready](https://img.shields.io/badge/PWA-100%25%20Offline%20First-059669?style=for-the-badge&logo=pwa)](https://github.com/shahriyarcse-arch/Lamim-)
[![Playwright E2E](https://img.shields.io/badge/Playwright-60%2F60%20PASS-22c55e?style=for-the-badge&logo=playwright)](https://github.com/shahriyarcse-arch/Lamim-)
[![Privacy First](https://img.shields.io/badge/Data%20Privacy-100%25%20Local%20IndexedDB-6366f1?style=for-the-badge)](https://github.com/shahriyarcse-arch/Lamim-)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

> **Lamim** is a state-of-the-art, fully responsive, **offline-first Progressive Web Application (PWA)** and Landing Page designed to bring mindfulness, spiritual discipline, physical wellness, and financial control into one cohesive daily companion. 

---

## ✨ Overview

Built with Vanilla JavaScript and styled using custom dark glassmorphic design tokens, Lamim operates **100% locally** on device using IndexedDB. No servers, no tracking, no external database dependencies—your intimate daily habits, prayer logs, dhikr counters, and financial transactions stay 100% private on your device.

---

## 🚀 Key Modules & Capabilities

### 1. 🏡 Home & Spirit Score Dashboard
* **Dynamic Spirit Score Orb**: Visual representation of your daily consistency across Salah, Dhikr, Fasting, and Habits.
* **Daily Inspiration**: Auto-rotating Quranic Ayah and Authentic Hadith with Arabic script and English translations.
* **Fasting Tracker**: One-tap logging for Fard (Ramadan) and Nafl fasts (Mondays/Thursdays, White Days).

### 2. 🕌 Salah (Prayer) Tracker
* **Local Solar Calculation**: Accurate prayer times calculated on-device based on latitude & longitude.
* **Interactive 21-Day Heatmap**: Visual grid tracking Fajr, Dhuhr, Asr, Maghrib, and Isha with Jama'at (congregation) indicators.
* **Next Prayer Countdown**: Real-time ticker displaying remaining hours and minutes to the next prayer.

### 3. 📿 Dhikr (Tasbeeh) Digital Counter
* **Interactive Tap Surface**: Haptic vibration feedback, subtle audio clicks, and glowing pulse micro-animations.
* **Preset & Custom Supplications**: Includes Morning/Evening Adhkar, SubhanAllah, Alhamdulillah, Allahu Akbar, and custom dhikr targets.
* **Streak & Milestone Tracker**: Daily target progress ring with historical total counts.

### 4. 🏋️ Gym & Health Tracker
* **Hydration Tracker**: Quick-log water intake (+250ml, +500ml) with dynamic progress ring toward daily intake target.
* **Workout & Step Tracking**: Log daily exercise routines, active durations, step counts, and physical energy levels.

### 5. 💼 Career & Skill Knowledge Ledger
* **Study & Focused Work Timer**: Track dedicated hours spent on skill building and professional projects.
* **Milestone Progress Tracker**: Record project completions, certifications, and career milestones.

### 6. 💳 Financial Ledger & Savings Vaults
* **Income & Expense Manager**: Track cashflow across 220+ categories with transaction timeline logs.
* **Chart.js Visual Analytics**: Monthly spending breakdown charts with budget limits.
* **Savings Vaults**: Set goal-based savings vaults with percentage-based progress bars.

### 7. 🌙 Spiritual Goals (Nafl & Tahajjud)
* **Sunnah & Optional Prayers**: Track Sunnah Mu'akkadah, Duha, Tahajjud, and Witr prayers.
* **3:00 AM "Waking Day" Logic**: Smart offset boundary ensuring late-night Tahajjud logs accurately attach to your waking day.

### 8. 📊 Analytics & Performance Intelligence
* **7-Day & 30-Day Trends**: Visual performance analytics powered by Chart.js.
* **PDF Statement Export**: Generate printable PDF summaries for personal reflections and financial audits.

### 9. 🎨 Design System & Theme Engine
* **Instant Theme Toggle**: Seamless 0.15s CSS variable transition between sleek Dark Mode and high-contrast Light Mode.
* **Glassmorphism Aesthetic**: Modern backdrop-filter blur surfaces, vibrant HSL accents, and crisp typography.

---

## 🔒 Privacy & Offline PWA Architecture

* **100% Offline Capable**: Custom Service Worker (`sw.js`) precaches static shell resources so the application loads instantly without internet access.
* **Local Data Safety**: Powered by IndexedDB (`lamim_db`) with RAM sync caching for 0ms read times and zero storage limits.
* **Data Portability**: Full JSON backup export and import system so you always own your data.

---

## 🧪 Automated Testing & QA Protocol

Lamim is backed by a comprehensive **Playwright End-to-End (E2E) Test Suite** with **100% PASS RATE** (60/60 tests passing):

| Browser Project | Test Suite Specs | Result | Status |
| :--- | :--- | :---: | :---: |
| **Chromium Desktop** | Landing, Onboarding, 9-Section Navigation, CRUD, Theme, SW, Viewports | 20 / 20 | PASS ✅ |
| **Mobile Chrome (Pixel 5)** | Landing, Onboarding, 9-Section Navigation, CRUD, Theme, SW, Viewports | 20 / 20 | PASS ✅ |
| **Mobile Safari (iPhone 12)** | Landing, Onboarding, 9-Section Navigation, CRUD, Theme, SW, Viewports | 20 / 20 | PASS ✅ |

### Running E2E Tests Locally

```bash
# Install dependencies
npm install

# Run all 60 Playwright tests headlessly
npm test

# Run tests in a visible browser window
npm run test:headed

# Open interactive Playwright UI dashboard
npm run test:ui

# View HTML test execution report
npm run test:report
```

---

## 🛠️ Tech Stack

* **Frontend**: HTML5, Vanilla CSS3 (Custom Tokens & Glassmorphic Utilities), ES6+ JavaScript.
* **Database**: Browser IndexedDB Engine (`lamim_db`).
* **Visualizations**: Chart.js (Loaded dynamically on demand).
* **Testing**: Playwright E2E Framework.
* **Local MIME Server**: Python HTTP Server (`tests/serve.py` on Port 9090).

---

## 📲 Installation (PWA Mobile & Desktop)

### On Mobile (Android / Chrome)
1. Open the app URL in Google Chrome.
2. Tap the browser menu (`⋮`) and select **"Add to Home screen"** or **"Install App"**.

### On iOS (iPhone / Safari)
1. Open the app URL in Safari.
2. Tap the Share button (`⎋`) and select **"Add to Home Screen"**.

---

*Designed and engineered for daily focus, spiritual consistency, and local data privacy.*
