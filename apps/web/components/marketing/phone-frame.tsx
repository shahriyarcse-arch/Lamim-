import Image from 'next/image';

const WASH = {
  dawn: 'bg-dawn',
  dusk: 'bg-dusk',
  celestial: 'bg-celestial',
} as const;

interface Props {
  src: string;
  alt: string;
  wash: keyof typeof WASH;
  priority?: boolean;
}

/** CSS-drawn phone frame around a real 375×812 app screenshot (2× WebP). */
export function PhoneFrame({ src, alt, wash, priority = false }: Props) {
  return (
    <figure className="relative mx-auto w-full max-w-64 lg:max-w-72">
      <span
        aria-hidden
        className={`absolute inset-8 -z-10 rounded-xl opacity-30 blur-3xl ${WASH[wash]}`}
      />
      <div className="relative aspect-[375/812] overflow-hidden rounded-device border-8 border-fg bg-fg shadow-raised dark:border-surface-subtle">
        <span
          aria-hidden
          className="absolute top-2 left-1/2 z-10 h-5 w-20 -translate-x-1/2 rounded-pill bg-fg dark:bg-surface-subtle"
        />
        <Image
          src={src}
          alt={alt}
          width={375}
          height={812}
          sizes="(min-width: 1024px) 288px, 256px"
          className="size-full object-cover object-top"
          {...(priority
            ? { priority: true, fetchPriority: 'high' as const }
            : { loading: 'lazy' as const })}
        />
      </div>
    </figure>
  );
}
