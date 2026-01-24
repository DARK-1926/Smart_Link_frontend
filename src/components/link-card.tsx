'use client';

import type { CSSProperties } from 'react';
import { ExternalLink } from 'lucide-react';
import { getIconComponent, cn } from '@/lib/utils';

interface LinkCardProps {
  title: string;
  url: string;
  icon?: string | null;
  onClick: () => void;
  className?: string;
  style?: CSSProperties;
}

function getHost(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function LinkCard({ title, url, icon, onClick, className, style }: LinkCardProps) {
  const host = getHost(url);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Open ${title}`}
      className={cn(
        'group relative w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-500/30 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)]',
        className,
      )}
      style={style}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500/10 via-transparent to-primary-500/5 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      <div className="relative flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary-500/20 bg-primary-500/10 text-xl text-primary-200 shadow-[0_10px_30px_rgba(34,197,94,0.18)]">
          <span className="leading-none">{getIconComponent(icon || null)}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-white transition-colors group-hover:text-primary-200 sm:text-lg">
            {title}
          </p>
          {host ? (
            <p className="mt-1 truncate text-xs text-white/40 font-mono">
              {host}
            </p>
          ) : null}
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/40 transition-colors group-hover:border-primary-500/40 group-hover:text-primary-300">
          <ExternalLink className="h-4 w-4" />
        </div>
      </div>
    </button>
  );
}
