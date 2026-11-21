import type { ReactNode } from 'react';
import { HABIT_RANK_NAMES } from '@/lib/habit-presets';
import { createT, locale, type Lang } from '@/lib/i18n';
import { Countdown } from './countdown';

/*
 * Vector mock-ups of the real app screens (same labels via the app's i18n), drawn
 * with DOM + SVG instead of raster screenshots so they stay razor-sharp at any
 * size, pixel density or 3D angle. Everything inside the screen is sized in `em`
 * against a font-size of 375ths of the device width, so one design scales cleanly.
 * The demo values mirror the app's own screenshots.
 */

/**
 * Shared SVG paint for every screen's rings. Render once per page, outside any
 * display:none subtree (a gradient defined inside a hidden element does not paint).
 */
export function ScreenDefs() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <defs>
        <linearGradient id="lamim-screen-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-raspberry)" />
          <stop offset="50%" stopColor="var(--color-violet)" />
          <stop offset="100%" stopColor="var(--color-cerulean)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export type ScreenId = 'home' | 'salah' | 'dhikr' | 'finance' | 'habits';

interface Ctx {
  lang: Lang;
  t: ReturnType<typeof createT>;
  num: (n: number) => string;
  money: (minor: number) => string;
}

function ctx(lang: Lang): Ctx {
  const nf = new Intl.NumberFormat(locale(lang));
  const cf = new Intl.NumberFormat(locale(lang), {
    style: 'currency',
    currency: 'BDT',
    currencyDisplay: 'narrowSymbol',
  });
  return { lang, t: createT(lang), num: (n) => nf.format(n), money: (m) => cf.format(m / 100) };
}

/** The physical device: titanium bezel, glass glare, dynamic island. */
export function Device({
  label,
  children,
  className = '',
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      className={`@container mx-auto w-full ${className}`}
    >
      <div className="device-bezel relative aspect-[375/812] rounded-[15cqw] p-[2.6cqw]">
        <span aria-hidden className="device-button absolute top-[22%] -left-[0.9cqw] h-[7%]" />
        <span aria-hidden className="device-button absolute top-[31%] -left-[0.9cqw] h-[11%]" />
        <span aria-hidden className="device-button absolute top-[27%] -right-[0.9cqw] h-[15%]" />
        <div
          aria-hidden
          className="relative size-full overflow-hidden rounded-[12.6cqw] bg-app text-[4.5cqw] leading-[1.35] text-fg"
        >
          {children}
          <span className="absolute top-[0.55em] left-1/2 h-[1.75em] w-[6.25em] -translate-x-1/2 rounded-pill bg-black" />
          <span className="device-glare pointer-events-none absolute inset-0" />
        </div>
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="flex h-[2.75em] items-center justify-between px-[1.75em] pt-[0.25em] text-[0.8em] font-semibold">
      <span className="tabular-nums">9:41</span>
      <span className="flex items-center gap-[0.35em]">
        <svg viewBox="0 0 18 12" className="h-[0.75em] fill-current">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5" width="3" height="7" rx="1" />
          <rect x="10" y="2.5" width="3" height="9.5" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg viewBox="0 0 16 12" className="h-[0.75em] fill-current">
          <path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.1-1.2A10.4 10.4 0 0 0 8 .6 10.4 10.4 0 0 0 .9 3.4L2 4.6a8.7 8.7 0 0 1 6-2.4Zm0 3.3c1.4 0 2.6.5 3.6 1.4l1.1-1.2A6.9 6.9 0 0 0 8 3.9 6.9 6.9 0 0 0 3.3 5.7l1.1 1.2c1-.9 2.2-1.4 3.6-1.4Zm0 3.3c-.6 0-1.1.2-1.5.6L8 11l1.5-1.6c-.4-.4-.9-.6-1.5-.6Z" />
        </svg>
        <span className="relative flex h-[0.8em] w-[1.6em] items-center rounded-[0.25em] border border-current p-[0.1em] opacity-90">
          <span className="h-full w-[75%] rounded-[0.12em] bg-current" />
        </span>
      </span>
    </div>
  );
}

function AppHeader() {
  return (
    <div className="flex items-center justify-between px-[1.1em] pt-[0.25em]">
      <span className="bg-celestial bg-clip-text text-[1.1em] font-bold text-transparent">
        Lamim
      </span>
      <span className="grid size-[1.9em] place-items-center rounded-pill border border-border">
        <svg viewBox="0 0 24 24" className="size-[0.95em] fill-none stroke-current stroke-2">
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
        </svg>
      </span>
    </div>
  );
}

const DOCK: { id: ScreenId | 'more'; d: string }[] = [
  { id: 'home', d: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z' },
  { id: 'salah', d: 'M12 3 4 9v12h16V9Zm-3 18v-6a3 3 0 0 1 6 0v6' },
  {
    id: 'dhikr',
    d: 'M12 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-7 8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm14 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  },
  { id: 'finance', d: 'M3 6h18v12H3Zm0 4h18M7 15h3' },
  { id: 'more', d: 'M4 4h6v6H4Zm10 0h6v6h-6ZM4 14h6v6H4Zm10 0h6v6h-6Z' },
];

function Dock({ active, c }: { active: ScreenId | 'more'; c: Ctx }) {
  return (
    <div className="absolute inset-x-[0.75em] bottom-[0.9em] flex justify-between rounded-[1.4em] border border-border bg-surface/90 px-[0.6em] py-[0.5em] backdrop-blur">
      {DOCK.map((item) => {
        const on = item.id === active;
        return (
          <span
            key={item.id}
            className={`relative grid flex-1 justify-items-center gap-[0.2em] text-[0.62em] ${on ? 'font-semibold text-fg' : 'text-fg-muted'}`}
          >
            {on ? (
              <span className="bg-celestial absolute -top-[0.8em] h-[0.25em] w-[2.4em] rounded-pill" />
            ) : null}
            <svg
              viewBox="0 0 24 24"
              className="size-[1.9em] fill-none stroke-current stroke-[1.8]"
              strokeLinejoin="round"
              strokeLinecap="round"
            >
              <path d={item.d} />
            </svg>
            {c.t(`nav.${item.id}` as 'nav.home')}
          </span>
        );
      })}
    </div>
  );
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[1.1em] border border-border bg-surface p-[0.9em] ${className}`}>
      {children}
    </div>
  );
}

function NextPrayer({ c }: { c: Ctx }) {
  return (
    <Card className="relative overflow-hidden">
      <span className="bg-dawn absolute -top-[2em] -right-[2em] size-[6em] rounded-full opacity-25 blur-xl" />
      <p className="text-[0.62em] font-semibold tracking-[0.12em] text-fg-muted uppercase">
        {c.t('salah.next')}
      </p>
      <div className="mt-[0.2em] flex items-end justify-between">
        <p className="text-[1.25em] font-bold">
          {c.t('prayer.isha')}{' '}
          <span className="text-[0.62em] font-medium text-fg-muted">
            {c.lang === 'bn' ? 'সন্ধ্যা ৬:৩০' : '6:30 PM'}
          </span>
        </p>
        <p className="text-[1.15em] font-semibold text-cerulean-text">
          <Countdown seconds={20 * 60 + 58} bn={c.lang === 'bn'} />
        </p>
      </div>
    </Card>
  );
}

function Ring({
  value,
  children,
  className = '',
}: {
  value: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative grid place-items-center ${className}`}>
      <svg viewBox="0 0 120 120" className="absolute inset-0 size-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="var(--color-surface-subtle)"
          strokeWidth="9"
        />
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="url(#lamim-screen-ring)"
          strokeWidth="9"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={`${value} 1`}
        />
      </svg>
      <div className="relative grid justify-items-center">{children}</div>
    </div>
  );
}

const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
type Status = 'jamaat' | 'alone' | 'qaza' | 'missed' | null;
const TODAY: Record<(typeof PRAYERS)[number], Status> = {
  fajr: 'jamaat',
  dhuhr: 'alone',
  asr: 'jamaat',
  maghrib: 'jamaat',
  isha: null,
};
const STATUS_FILL: Record<Exclude<Status, null>, string> = {
  jamaat: 'bg-cerulean',
  alone: 'bg-iris',
  qaza: 'bg-violet',
  missed: 'bg-terracotta',
};

function Check() {
  return (
    <svg viewBox="0 0 24 24" className="size-[0.9em] fill-none stroke-white stroke-[3]">
      <path d="m5 12 5 5 9-10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HomeScreen({ lang }: { lang: Lang }) {
  const c = ctx(lang);
  const score = 72;
  return (
    <>
      <StatusBar />
      <AppHeader />
      <div className="grid gap-[0.7em] px-[1.1em] pt-[0.6em]">
        <h3 className="text-[1.45em] leading-tight font-bold tracking-tight">
          {c.t('home.title')}
        </h3>
        <NextPrayer c={c} />
        <Card className="grid justify-items-center gap-[0.4em]">
          <p className="justify-self-start text-[0.8em] font-semibold">{c.t('home.shs.title')}</p>
          <Ring value={score / 100} className="size-[8.5em]">
            <span className="text-[2.3em] leading-none font-bold tabular-nums">{c.num(score)}</span>
            <span className="text-[0.62em] text-fg-muted">{c.t('shs.mindful')}</span>
          </Ring>
        </Card>
        <Card>
          <p className="mb-[0.6em] text-[0.8em] font-semibold">{c.t('home.timeline.title')}</p>
          <div className="flex justify-between">
            {PRAYERS.map((p) => {
              const s = TODAY[p];
              return (
                <span key={p} className="grid justify-items-center gap-[0.3em]">
                  <span
                    className={`grid size-[2.1em] place-items-center rounded-pill ${s ? STATUS_FILL[s] : 'border-2 border-dashed border-cerulean'}`}
                  >
                    {s ? <Check /> : null}
                  </span>
                  <span className="text-[0.58em] text-fg-muted">{c.t(`prayer.${p}`)}</span>
                </span>
              );
            })}
          </div>
        </Card>
      </div>
      <Dock active="home" c={c} />
    </>
  );
}

export function SalahScreen({ lang }: { lang: Lang }) {
  const c = ctx(lang);
  const times: Record<(typeof PRAYERS)[number], string> =
    lang === 'bn'
      ? { fajr: '৪:৫৮', dhuhr: '১১:৪৪', asr: '৩:৩৮', maghrib: '৫:১৩', isha: '৬:৩০' }
      : { fajr: '4:58 AM', dhuhr: '11:44 AM', asr: '3:38 PM', maghrib: '5:13 PM', isha: '6:30 PM' };
  const statuses = ['jamaat', 'alone', 'qaza', 'missed'] as const;
  return (
    <>
      <StatusBar />
      <AppHeader />
      <div className="grid gap-[0.6em] px-[1.1em] pt-[0.6em]">
        <div>
          <h3 className="text-[1.45em] leading-tight font-bold tracking-tight">
            {c.t('salah.title')}
          </h3>
          <p className="text-[0.68em] text-fg-muted">
            {lang === 'bn'
              ? 'আজ · শনিবার, ২১ নভেম্বর · ১০ জুমাদাল আখিরাহ ১৪৪৮'
              : 'Today · Saturday, November 21 · 10 Jumada II 1448'}
          </p>
        </div>
        <NextPrayer c={c} />
        {(['fajr', 'dhuhr', 'asr', 'maghrib'] as const).map((p) => (
          <Card key={p} className="grid gap-[0.5em] !p-[0.75em]">
            <p className="text-[0.85em] font-semibold">
              {c.t(`prayer.${p}`)}{' '}
              <span className="text-[0.8em] font-normal text-fg-muted">{times[p]}</span>
            </p>
            <div className="grid grid-cols-4 gap-[0.35em]">
              {statuses.map((s) => {
                const on = TODAY[p] === s;
                return (
                  <span
                    key={s}
                    className={`rounded-[0.6em] py-[0.35em] text-center text-[0.58em] font-semibold ${on ? `${STATUS_FILL[s]} text-white` : 'border border-border text-fg-muted'}`}
                  >
                    {c.t(`status.${s}`)}
                  </span>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
      <Dock active="salah" c={c} />
    </>
  );
}

export function DhikrScreen({ lang }: { lang: Lang }) {
  const c = ctx(lang);
  const presets =
    lang === 'bn'
      ? ['সুবহানাল্লাহ', 'আলহামদুলিল্লাহ', 'আল্লাহু আকবার']
      : ['SubhanAllah', 'Alhamdulillah', 'Allahu Akbar'];
  return (
    <>
      <StatusBar />
      <AppHeader />
      <div className="grid gap-[0.8em] px-[1.1em] pt-[0.6em]">
        <h3 className="text-[1.45em] leading-tight font-bold tracking-tight">
          {c.t('dhikr.title')}
        </h3>
        <div className="flex gap-[0.4em] overflow-hidden">
          {presets.map((p, i) => (
            <span
              key={p}
              className={`shrink-0 rounded-pill px-[0.8em] py-[0.35em] text-[0.68em] font-semibold whitespace-nowrap ${i === 0 ? 'bg-iris-strong text-white' : 'border border-border text-fg-muted'}`}
            >
              {p}
            </span>
          ))}
        </div>
        <Card className="grid justify-items-center gap-[0.8em] !py-[1.4em]">
          <p lang="ar" dir="rtl" className="font-quran text-[1.4em] leading-normal">
            سُبْحَانَ ٱللَّٰهِ
          </p>
          <Ring value={21 / 33} className="size-[11em]">
            <span className="text-[3.4em] leading-none font-bold tabular-nums">{c.num(21)}</span>
            <span className="text-[0.68em] text-fg-muted">
              {c.t('dhikr.milestone', { count: 21, to: 33 })}
            </span>
          </Ring>
          <p className="text-[0.62em] text-fg-muted">{c.t('dhikr.tapHint')}</p>
        </Card>
        <p className="text-center text-[0.7em] text-fg-muted">
          {c.t('dhikr.totalToday', { count: 99 })}
        </p>
      </div>
      <Dock active="dhikr" c={c} />
    </>
  );
}

function Bar({ value, className }: { value: number; className: string }) {
  return (
    <span className="block h-[0.4em] w-full overflow-hidden rounded-pill bg-surface-subtle">
      <span
        className={`block h-full rounded-pill ${className}`}
        style={{ width: `${value * 100}%` }}
      />
    </span>
  );
}

export function FinanceScreen({ lang }: { lang: Lang }) {
  const c = ctx(lang);
  const top: [string, number, string][] =
    lang === 'bn'
      ? [
          ['খাবার', 120_000, 'bg-raspberry'],
          ['যাতায়াত', 50_075, 'bg-iris'],
          ['সাদাকাহ', 30_000, 'bg-cerulean'],
        ]
      : [
          ['Food', 120_000, 'bg-raspberry'],
          ['Transport', 50_075, 'bg-iris'],
          ['Sadaqah', 30_000, 'bg-cerulean'],
        ];
  return (
    <>
      <StatusBar />
      <AppHeader />
      <div className="grid gap-[0.6em] px-[1.1em] pt-[0.6em]">
        <div className="flex items-center justify-between">
          <h3 className="text-[1.45em] leading-tight font-bold tracking-tight">
            {c.t('finance.title')}
          </h3>
          <span className="flex rounded-pill border border-border p-[0.15em] text-[0.6em] font-semibold">
            <span className="px-[0.7em] py-[0.2em] text-fg-muted">$ USD</span>
            <span className="rounded-pill bg-raspberry-strong px-[0.7em] py-[0.2em] text-white">
              ৳ BDT
            </span>
          </span>
        </div>
        <Card className="relative grid gap-[0.5em] overflow-hidden">
          <span className="bg-dusk absolute -top-[3em] -right-[3em] size-[7em] rounded-full opacity-25 blur-xl" />
          <p className="text-[0.62em] font-semibold tracking-[0.12em] text-fg-muted uppercase">
            {c.t('finance.balance')}
          </p>
          <p className="text-[1.75em] leading-none font-bold tracking-tight tabular-nums">
            {c.money(3_749_925)}
          </p>
          <p className="mt-[0.3em] text-[0.68em] font-semibold">{c.t('finance.month')}</p>
          <div className="grid grid-cols-[4em_1fr_auto] items-center gap-x-[0.5em] gap-y-[0.35em] text-[0.62em] tabular-nums">
            <span className="text-fg-muted">{c.t('finance.income')}</span>
            <Bar value={1} className="bg-cerulean" />
            <span>{c.money(5_000_000)}</span>
            <span className="text-fg-muted">{c.t('finance.expense')}</span>
            <Bar value={0.04} className="bg-terracotta" />
            <span>{c.money(200_075)}</span>
          </div>
        </Card>
        <Card className="grid gap-[0.45em]">
          <p className="text-[0.75em] font-semibold">{c.t('finance.budget')}</p>
          <Bar value={0.067} className="bg-celestial" />
          <p className="text-[0.6em] text-fg-muted tabular-nums">
            {c.t('finance.budget.status', { spent: c.money(200_075), budget: c.money(3_000_000) })}
          </p>
        </Card>
        <Card className="grid gap-[0.5em]">
          <p className="text-[0.75em] font-semibold">{c.t('finance.topCategories')}</p>
          {top.map(([name, minor, color]) => (
            <div key={name} className="flex items-center gap-[0.6em] text-[0.68em]">
              <span className={`size-[0.6em] rounded-pill ${color}`} />
              <span className="flex-1">{name}</span>
              <span className="font-semibold tabular-nums">{c.money(minor)}</span>
            </div>
          ))}
        </Card>
      </div>
      <Dock active="finance" c={c} />
    </>
  );
}

export function HabitsScreen({ lang }: { lang: Lang }) {
  const c = ctx(lang);
  const rank = HABIT_RANK_NAMES[3];
  const next = HABIT_RANK_NAMES[4];
  const rankName = (r: typeof rank) => (r ? (lang === 'bn' ? r.nameBn : r.name) : '');
  const units: [number, string][] = [
    [23, c.t('habits.days')],
    [4, c.t('habits.hours')],
    [12, c.t('habits.minutes')],
  ];
  return (
    <>
      <StatusBar />
      <AppHeader />
      <div className="grid gap-[0.7em] px-[1.1em] pt-[0.6em]">
        <h3 className="text-[1.45em] leading-tight font-bold tracking-tight">
          {c.t('habits.title')}
        </h3>
        <Card className="relative grid gap-[0.7em] overflow-hidden">
          <span className="bg-dusk absolute -bottom-[3em] -left-[3em] size-[8em] rounded-full opacity-20 blur-xl" />
          <div className="flex items-center justify-between">
            <p className="text-[0.85em] font-semibold">
              {lang === 'bn' ? 'অপ্রয়োজনীয় স্ক্রলিং' : 'Mindless scrolling'}
            </p>
            <span className="rounded-pill bg-terracotta-strong px-[0.7em] py-[0.15em] text-[0.58em] font-semibold text-white">
              {c.t('habits.clean')}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-[0.4em]">
            {units.map(([n, label]) => (
              <span
                key={label}
                className="grid justify-items-center rounded-[0.8em] bg-surface-subtle py-[0.6em]"
              >
                <span className="text-[1.9em] leading-none font-bold tabular-nums">{c.num(n)}</span>
                <span className="text-[0.58em] text-fg-muted">{label}</span>
              </span>
            ))}
          </div>
          <div className="grid gap-[0.35em]">
            <div className="flex justify-between text-[0.6em]">
              <span className="font-semibold">{c.t('habits.rank', { rank: rankName(rank) })}</span>
              <span className="text-fg-muted">
                {c.t('habits.nextRank', { days: 7, rank: rankName(next) })}
              </span>
            </div>
            <Bar value={2 / 9} className="bg-dusk" />
          </div>
        </Card>
        <Card className="grid grid-cols-[auto_1fr] items-center gap-[0.8em]">
          <span className="bg-dawn grid size-[2.6em] place-items-center rounded-pill">
            <span className="size-[1em] rounded-pill bg-white/80" />
          </span>
          <span className="grid">
            <span className="text-[0.8em] font-semibold">4 · 7 · 8</span>
            <span className="text-[0.62em] text-fg-muted">
              {lang === 'bn' ? 'শ্বাসের ব্যায়াম' : 'Breathing exercise'}
            </span>
          </span>
        </Card>
      </div>
      <Dock active="more" c={c} />
    </>
  );
}

export const SCREENS: Record<ScreenId, (p: { lang: Lang }) => ReactNode> = {
  home: HomeScreen,
  salah: SalahScreen,
  dhikr: DhikrScreen,
  finance: FinanceScreen,
  habits: HabitsScreen,
};
