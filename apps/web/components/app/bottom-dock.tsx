'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentType, SVGProps } from 'react';
import type { MessageKey } from '@/lib/i18n';
import { useApp } from './app-provider';
import { DhikrIcon, FinanceIcon, HomeIcon, MoreIcon, SalahIcon } from './icons';

interface DockItem {
  href: string;
  label: MessageKey;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Routes not migrated yet render as disabled instead of linking to a 404. */
  ready: boolean;
}

const ITEMS: readonly DockItem[] = [
  { href: '/app/home', label: 'nav.home', Icon: HomeIcon, ready: true },
  { href: '/app/salah', label: 'nav.salah', Icon: SalahIcon, ready: true },
  { href: '/app/dhikr', label: 'nav.dhikr', Icon: DhikrIcon, ready: true },
  { href: '/app/finance', label: 'nav.finance', Icon: FinanceIcon, ready: false },
  { href: '/app/more', label: 'nav.more', Icon: MoreIcon, ready: false },
];

export function BottomDock() {
  const pathname = usePathname();
  const { t } = useApp();

  return (
    <nav
      aria-label={t('nav.label')}
      className="fixed inset-x-0 bottom-0 z-(--z-dock) px-4 pb-[max(--spacing(2),env(safe-area-inset-bottom))]"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5 gap-1 rounded-xl border border-border bg-surface/90 p-2 shadow-raised backdrop-blur-md">
        {ITEMS.map(({ href, label, Icon, ready }) => {
          const active = pathname === href;
          const base =
            'relative grid min-h-12 place-items-center gap-0.5 rounded-lg px-1 py-1 text-micro font-medium transition-colors';
          if (!ready) {
            return (
              <li key={href}>
                <span
                  aria-disabled="true"
                  title={t('nav.soon')}
                  className={`${base} cursor-not-allowed text-fg-subtle opacity-70`}
                >
                  <Icon />
                  <span>{t(label)}</span>
                  <span className="sr-only">({t('nav.soon')})</span>
                </span>
              </li>
            );
          }
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`${base} ${active ? 'text-fg' : 'text-fg-muted hover:bg-surface-subtle hover:text-fg'} active:scale-95`}
              >
                {active ? (
                  <span
                    aria-hidden
                    className="bg-celestial absolute inset-x-4 top-0 h-1 rounded-pill"
                  />
                ) : null}
                <Icon />
                <span>{t(label)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
