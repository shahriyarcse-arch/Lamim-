import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const HomeIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
  </Icon>
);

export const SalahIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3c-3 2.5-5 4.6-5 7.2V12h10v-1.8C17 7.6 15 5.5 12 3Z" />
    <path d="M5 12h14v9H5zM10 21v-4a2 2 0 0 1 4 0v4" />
  </Icon>
);

export const DhikrIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="5" r="2" />
    <circle cx="6.5" cy="9" r="2" />
    <circle cx="17.5" cy="9" r="2" />
    <circle cx="8" cy="15.5" r="2" />
    <circle cx="16" cy="15.5" r="2" />
    <path d="M12 17.5V21" />
  </Icon>
);

export const FinanceIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="6" width="18" height="13" rx="2" />
    <path d="M3 10h18M16 15h2" />
  </Icon>
);

export const MoreIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="4" y="4" width="6" height="6" rx="1.5" />
    <rect x="14" y="4" width="6" height="6" rx="1.5" />
    <rect x="4" y="14" width="6" height="6" rx="1.5" />
    <rect x="14" y="14" width="6" height="6" rx="1.5" />
  </Icon>
);

export const SunIcon = (p: IconProps) => (
  <Icon width="18" height="18" {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Icon>
);

export const MoonIcon = (p: IconProps) => (
  <Icon width="18" height="18" {...p}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
  </Icon>
);

export const PinIcon = (p: IconProps) => (
  <Icon width="18" height="18" {...p}>
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </Icon>
);

/** Star filled with the official celestial gradient (badge for all-on-time days). */
export function CelestialStar({ size = 16, title }: { size?: number; title?: string }) {
  const id = 'celestial-star-gradient';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-terracotta)" />
          <stop offset="40%" stopColor="var(--color-violet)" />
          <stop offset="100%" stopColor="var(--color-cerulean)" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9L12 2.5Z"
      />
    </svg>
  );
}
