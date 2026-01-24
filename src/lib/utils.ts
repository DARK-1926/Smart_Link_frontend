import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function getIconComponent(iconName: string | null): string {
  const iconMap: Record<string, string> = {
    // Social
    globe: '\u{1F310}',
    linkedin: '\u{1F4BC}',
    github: '\u{1F419}',
    twitter: '\u{1F426}',
    x: 'X',
    instagram: '\u{1F4F8}',
    youtube: '\u{1F4FA}',
    tiktok: '\u{1F3B5}',
    facebook: '\u{1F465}',
    twitch: '\u{1F3AE}',
    discord: '\u{1F4AC}',
    reddit: '\u{1F534}',

    // Communication
    mail: '\u{1F4E7}',
    email: '\u{1F4E7}',
    phone: '\u{1F4F1}',
    whatsapp: '\u{1F4AC}',
    telegram: '\u{1F4E8}',

    // Professional
    portfolio: '\u{1F4BC}',
    resume: '\u{1F4C4}',
    cv: '\u{1F4C4}',
    blog: '\u{1F4DD}',
    website: '\u{1F310}',

    // Actions
    download: '\u{2B07}\u{FE0F}',
    shop: '\u{1F6D2}',
    store: '\u{1F3EA}',
    buy: '\u{1F4B3}',
    donate: '\u{1F49D}',

    // Content
    music: '\u{1F3B5}',
    spotify: '\u{1F3A7}',
    podcast: '\u{1F399}\u{FE0F}',
    video: '\u{1F3AC}',
    photo: '\u{1F4F7}',

    // Learning
    book: '\u{1F4DA}',
    course: '\u{1F393}',
    learn: '\u{1F4D6}',

    // Tech
    code: '\u{1F4BB}',
    app: '\u{1F4F1}',
    api: '\u{26A1}',

    // Business
    calendar: '\u{1F4C5}',
    meeting: '\u{1F465}',
    booking: '\u{1F4C6}',

    // Other
    link: '\u{1F517}',
    star: '\u{2B50}',
    heart: '\u{2764}\u{FE0F}',
    fire: '\u{1F525}',
    rocket: '\u{1F680}',
    sparkle: '\u{2728}',
    pin: '\u{1F4CD}',
    location: '\u{1F4CD}',

    // Default
    default: '\u{1F517}',
  };

  if (!iconName) return iconMap.default;

  const normalizedName = iconName.toLowerCase().trim();
  return iconMap[normalizedName] || iconMap.default;
}

export function getRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return formatDate(date);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
