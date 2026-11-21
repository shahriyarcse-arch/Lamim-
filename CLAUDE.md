# 🌿 CLAUDE.md — Lamim Master Architecture & Agentic Guidelines

> **Project**: Lamim — Precision Islamic Life Operating System & Landing Page  
> **Role**: Senior Principal Full-Stack & Systems Architect  
> **Core Priority Hierarchy**: SECURITY > DATA INTEGRITY > PERFORMANCE > UX > AESTHETICS

---

## 1. Executive Modernization Target & Monorepo Architecture

Turborepo + pnpm workspace structure:

```
lamim/
├── apps/
│   ├── web/                     # Next.js 15 (React 19, TypeScript)
│   │   └── app/
│   │       ├── (marketing)/     # 🌐 Landing Page (SSR, SEO, OpenGraph) -> lamim.tech/
│   │       │   └── page.tsx
│   │       └── (app)/app/       # 📱 PWA Life OS (Scoped to /app/* for existing PWA SW)
│   │           ├── layout.tsx   # Ergonomic Dock, Serwist PWA shell
│   │           ├── home/page.tsx
│   │           ├── salah/page.tsx
│   │           ├── dhikr/page.tsx
│   │           ├── finance/page.tsx
│   │           └── ...
│   └── api/                     # NestJS (Deferred to Phase 2)
│
├── packages/
│   ├── core/                    # Pure TS (Zero DOM/React, tested via Vitest):
│   │                            # - Astronomical solar prayer calculation & memoization
│   │                            # - Hijri calendar conversion
│   │                            # - 3:00 AM waking day offset logic
│   │                            # - Spirit Score (SHS) calculation
│   │                            # - Salah scoring & streaks
│   │                            # - Money helper (Integer minor units, fxRateMicro)
│   ├── db/                      # Dexie.js v4 schema, repositories & Legacy Importer
│   └── config/                  # Shared tsconfig, ESLint, Prettier
```

| Layer | Modernized Target Stack |
| :--- | :--- |
| **Frontend Framework** | Next.js 15 (App Router, React 19, TypeScript) |
| **Styling & UI** | Tailwind CSS v4 (CSS-first, `@theme`, `@utility`, no tailwind.config) |
| **Motion Physics** | `motion/react` for all UI motion (Spirit orb, dhikr ring, transitions) under `MotionConfig reducedMotion="user"`; `animejs` only if a future effect needs it (dynamic import) |
| **Local Database** | IndexedDB via Dexie.js v4 (UUID v7, profileId, updatedAt, tombstones) |
| **Offline PWA** | Serwist (`@serwist/next`, supersedes next-pwa) scoped to `/app/*` |
| **Backend API** | NestJS (Phase 2: Auth, Sync Engine, LangGraph.js) |
| **Cloud Database** | PostgreSQL (Neon) + Prisma ORM + `pgvector` (Phase 2) |
| **Testing** | Vitest for `packages/core` & `packages/db`, Playwright for E2E |

---

## 2. Official Visual Design System & Tailwind v4 Tokens

### 2.1 The Official 6-Color Brand Tokens (`--color-*` namespace)
Strictly standardized under `--color-*` for seamless Tailwind v4 `@theme` integration:

| Token Name | Hex Code | Role / Module Mapping |
| :--- | :--- | :--- |
| `--color-terracotta` | `#C25E5E` | Maghrib sunset, high-priority habit alerts, streak resets |
| `--color-raspberry`  | `#C05683` | Fajr dawn glow, savings vault progress, active badges |
| `--color-violet`     | `#A45EAA` | Contemplative Nafl & Tahajjud, spiritual reflections |
| `--color-iris`       | `#656EC9` | Isha night sky, focus timer, study sessions |
| `--color-azure`      | `#007CD3` | Dhuhr midday clarity, hydration tracker, verified badges |
| `--color-cerulean`   | `#0085C1` | Asr celestial blue, primary CTAs, active Salah indicator |

### 2.2 Tailwind CSS v4 CSS-First Spec (`globals.css`)

```css
@import "tailwindcss";

@theme {
  --color-terracotta: #C25E5E;
  --color-raspberry:  #C05683;
  --color-violet:     #A45EAA;
  --color-iris:       #656EC9;
  --color-azure:      #007CD3;
  --color-cerulean:   #0085C1;
}

@utility bg-celestial {
  background-image: linear-gradient(135deg, #C25E5E 0%, #C05683 20%, #A45EAA 40%, #656EC9 60%, #007CD3 80%, #0085C1 100%);
}
@utility bg-dusk {
  background-image: linear-gradient(135deg, #C25E5E, #C05683, #A45EAA);
}
@utility bg-dawn {
  background-image: linear-gradient(135deg, #656EC9, #007CD3, #0085C1);
}

@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));

:root {
  --bg-app: #F8FAFC;
  --bg-surface: #FFFFFF;
  --bg-surface-subtle: #F1F5F9;
  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-tertiary: #606F86; /* ≥4.5:1 on app, surface AND surface-subtle (#64748B was 4.34 on subtle) */
  --border-subtle: #E2E8F0;
  --border-focus: #007CD3;
}

[data-theme="dark"] {
  --bg-app: #070B14;
  --bg-surface: #0E1626;
  --bg-surface-subtle: #162035;
  --text-primary: #F8FAFC;
  --text-secondary: #94A3B8;
  --text-tertiary: #7D8B9E; /* #64748B was only 3.4–4.1:1 on dark surfaces */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-focus: #007CD3;
}
```

### 2.3 Brand Contrast Contract (enforced by `apps/web/__tests__/contrast.test.ts`)
The 6 brand hexes fail 4.5:1 as body text and behind white body text (only iris passes on white). So:
- **Raw brand hex** (`bg-cerulean`, gradients): fills, icons, borders, large text only (≥3:1 verified).
- **`bg-<brand>-strong` + `text-white`**: buttons/badges with body-size text. Brand mixed 6–12% toward black.
- **`text-<brand>-text`**: body-size brand-colored text; theme-aware (darker shade in light, lighter tint in dark).
- Semantic utilities: `bg-app`, `bg-surface`, `bg-surface-subtle`, `text-fg`, `text-fg-muted`, `text-fg-subtle`, `border-border`, `outline-focus`.
- Any new color token must be added to the contrast test.

---

## 3. Data & Storage System Design (Dexie.js v4)

Every table entry requires:
- `id`: UUID v7 (time-ordered)
- `profileId`: string
- `updatedAt`: number (UTC ms epoch)
- `deletedAt`: number | null (soft-delete tombstone for sync)

### 3.1 Tables Architecture
1. **`profiles`**: `id, legacyId, name, gender, dob`
2. **`settings`**: `profileId, lang, currency, lat, lng, method`
3. **`salahEntries`**: `id, &[profileId+date+prayer], [profileId+date]`  
   *(One row per prayer to avoid concurrent multi-device overwrite)*
4. **`salahDays`**: `&[profileId+date], tahajjud, jummah, notes`
5. **`dhikrLogs`, `gymLogs`, `careerLogs`**: `&[profileId+date]` — Gym and Career are dropped from the product (no UI or routes); their tables keep imported legacy data read-only so nothing is lost.
6. **`habits`, `habitEvents`**: `id, profileId, [profileId+updatedAt]`  
   *(Relapses stored as immutable event rows, not mutating arrays)*
7. **`transactions`**: `id, [profileId+date], [profileId+type], categoryId`
8. **`vaults`**: `id, profileId, targetMinor, savedMinor`
9. **`zakatProfiles`**: `id, &profileId` — `nisabMinor` + per-asset `cashMinor/goldMinor/silverMinor/businessMinor/stocksMinor` (totals are derived, never stored)
10. **`kv`**: `id, &[profileId+key]` — small documents: goals, gym body metrics/PRs, career achievements/timer, dhikr presets (`profileId = 'global'`)
11. **`syncQueue`**: `++seq, [table+rowId]`
12. **`meta`**: `key, value` *(tracks `migratedFrom` status, `activeProfileId`)*
13. **`quarantine`**: `++seq, legacyKey, reason` — invalid legacy records with raw JSON
14. **`legacyArchive`**: `key, legacyKey` — every legacy key/value verbatim, per source

Schema source of truth: `packages/db/src/schema.ts` (`SCHEMA_V1`). Fields not yet typed are preserved in `extra`.

### 3.2 Money Rules (Zero Float Error)
- `amountMinor`: Integer in the currency entered (BDT or USD cents/paisa).
- `currency`: `'BDT' | 'USD'`.
- `fxRateMicro`: Integer exchange rate multiplied by $10^6$.
- `baseMinor`: Integer USD cents, or `null` for non-USD entries recorded before any rate was known (single-currency users never need a rate; backfilled at sync).
- Display formatting only via `Intl.NumberFormat`.

---

## 4. Legacy Importer Protocol (Zero Data Loss)
- On first boot: Check `meta.migratedFrom`. If absent, open legacy `lamim_db` read-only.
- Validate every key/record via Zod.
- Atomically commit into Dexie inside a single transaction.
- Invalid records are routed to a `quarantine` table (never discarded).
- Never delete `lamim_db`.
- Sources: IndexedDB `lamim_db` and the localStorage fallback; IndexedDB wins on conflict, both archived.
- Imported profiles are pinned to MWL + Hanafi (legacy behavior); `resolveDefaultPrayerSettings` is for new profiles only.
- Legacy amounts were USD floats (BDT input converted at entry, rate not stored): imported as USD cents with `baseMinor = amountMinor`.

---

## 5. Master Autonomous Multi-Agent Swarm Protocol

For all remaining phases (Landing Page, Backend Cloud Sync, LangGraph Islamic AI, and Production Deployment), Claude must operate as the **Lead Swarm Orchestrator** managing specialized autonomous roles:

```
                          LEAD SWARM ORCHESTRATOR (Claude)
                                         │
     ┌───────────────────┬───────────────┴───────────────┬───────────────────┐
     ▼                   ▼                               ▼                   ▼
[ Editorial & ]     [ Visual UI & ]              [ Backend & Data ]    [ QA, Security & ]
[ Content Agent]    [ Motion Agent]              [ Systems Agent  ]    [ DevOps Agent   ]
```

### Specialized Roles & Mandates:
1. **Editorial & Content Agent**:
   - Protects authentic Islamic stewardship voice, monograph copywriting, and typography.
   - Strictly enforces: ZERO generic "AI slop" or synthetic marketing fluff.
2. **Visual UI & Motion Agent**:
   - Enforces the 6-color celestial gradient (#C25E5E to #0085C1) and Tailwind v4 CSS-first tokens.
   - Crafts smooth Framer Motion / Anime.js micro-interactions, responsive Bento grids, and mobile-first ergonomics.
3. **Backend & Data Systems Agent**:
   - Manages NestJS modular backend, Prisma ORM, Neon PostgreSQL, and bi-directional offline sync (LWW).
   - Builds LangGraph.js verified state-machine RAG pipelines with `pgvector` for authentic Quran/Hadith retrieval.
4. **QA, Security & DevOps Agent**:
   - Enforces OWASP security standards, sliding-window rate limiting, and zero floating-point money bugs.
   - Runs automated Vitest and Playwright E2E suites with silent outputs to preserve token context.

### Execution Cycle per Phase:
`Plan Breakdown` ➔ `Role Delegation` ➔ `Atomic Implementation` ➔ `Silent Automated Verification` ➔ `Atomic Commit`.

---

## 6. Cloud Database & Neon Infrastructure

- **Cloud Provider**: Neon Serverless PostgreSQL (AWS us-east-2)
- **Organization ID**: `org-broad-meadow-49182162`
- **Project ID**: `fragrant-star-54354336` (`neondb`)
- **Connection Strings**: Stored in root `.env` and `apps/web/.env.local`
- **Driver Standards**:
  - `apps/web` (Next.js serverless): `@neondatabase/serverless` via pooled connection.
  - `apps/api` (NestJS / Prisma): Prisma Client with pooled `DATABASE_URL` and direct `DIRECT_URL` for schema migrations.
  - Vector Extension: `pgvector` enabled for Islamic Knowledge RAG.
