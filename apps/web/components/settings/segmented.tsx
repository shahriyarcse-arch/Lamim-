'use client';

import { useId } from 'react';

interface Option<V extends string> {
  value: V;
  label: string;
  /** Optional language of the label (e.g. "bn" for বাংলা in an English UI). */
  lang?: string;
}

interface Props<V extends string> {
  legend: string;
  value: V;
  options: readonly Option<V>[];
  onChange: (value: V) => void;
  /** Stack options vertically (long labels). */
  vertical?: boolean;
}

/** Native radio group styled as pills: arrow keys, focus and screen readers work for free. */
export function Segmented<V extends string>({
  legend,
  value,
  options,
  onChange,
  vertical,
}: Props<V>) {
  const name = useId();
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-2 text-caption font-semibold text-fg">{legend}</legend>
      <div className={vertical ? 'grid gap-2' : 'flex flex-wrap gap-2'}>
        {options.map((o) => (
          <label key={o.value} className="relative cursor-pointer">
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="peer sr-only"
            />
            <span
              lang={o.lang}
              className={`flex min-h-11 items-center rounded-pill border border-border px-4 py-2 text-caption font-medium text-fg-muted transition-colors peer-checked:border-transparent peer-checked:bg-cerulean-strong peer-checked:text-white peer-hover:bg-surface-subtle peer-hover:text-fg peer-checked:peer-hover:bg-cerulean-strong peer-checked:peer-hover:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus ${
                vertical ? 'justify-start' : 'justify-center'
              }`}
            >
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
