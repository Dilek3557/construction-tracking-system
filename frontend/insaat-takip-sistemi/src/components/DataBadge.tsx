import type { ReactNode } from 'react';

/** Firma / proje adı gibi alanlar için kurumsal veri etiketi. */
export default function DataBadge({
  children,
  className = '',
  size = 'md',
}: {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClass =
    size === 'lg'
      ? 'px-3 py-1.5 text-base'
      : size === 'sm'
        ? 'px-2 py-0.5 text-xs'
        : 'px-2.5 py-1 text-sm';
  return (
    <span
      className={`inline-flex max-w-full items-center rounded border border-white/10 bg-white/[0.05] font-medium tracking-wide text-slate-100 ring-1 ring-white/5 ${sizeClass} ${className}`}
    >
      <span className="truncate">{children}</span>
    </span>
  );
}
