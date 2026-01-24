'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Check, Link2, Share2 } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import api from '@/lib/api';
import { LinkCard } from '@/components/link-card';

interface Hub {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  theme: string;
}

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string | null;
}

const DEMO_FALLBACK = {
  hub: {
    id: 'demo-hub',
    slug: 'demo-hub',
    title: 'Greenroom Demo Hub',
    description: 'A live demo of adaptive links with bold green vibes.',
    theme: 'black-green',
  },
  links: [
    { id: 'demo-1', title: 'Portfolio Launchpad', url: 'https://example.com/portfolio', icon: 'globe' },
    { id: 'demo-2', title: 'LinkedIn Profile', url: 'https://linkedin.com/in/demo', icon: 'linkedin' },
    { id: 'demo-3', title: 'GitHub Projects', url: 'https://github.com/demo', icon: 'github' },
    { id: 'demo-4', title: 'Download Our App', url: 'https://example.com/app', icon: 'download' },
    { id: 'demo-5', title: 'Contact Me', url: 'mailto:demo@example.com', icon: 'mail' },
  ],
};

export default function PublicHubPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [hub, setHub] = useState<Hub | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.06,
        delayChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 10 },
    show: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    async function fetchHub() {
      try {
        const response = await api.getPublicHub(slug);
        if (response.success && response.data) {
          setHub(response.data.hub);
          setLinks(response.data.links);
          setError(null);
          return;
        }
        if (slug === 'demo-hub') {
          setHub(DEMO_FALLBACK.hub);
          setLinks(DEMO_FALLBACK.links);
          setError(null);
          return;
        }
        setError(response.error || 'Hub not found');
      } catch {
        if (slug === 'demo-hub') {
          setHub(DEMO_FALLBACK.hub);
          setLinks(DEMO_FALLBACK.links);
          setError(null);
          return;
        }
        setError('Failed to load hub');
      } finally {
        setLoading(false);
      }
    }

    fetchHub();
  }, [slug]);

  const handleLinkClick = (link: LinkItem) => {
    if (!link.id.startsWith('demo-')) {
      api.recordClickBeacon(link.id);
    }
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: hub?.title, url });
        return;
      } catch {
        // Fallback to copy
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--bg)] text-white relative overflow-hidden">
        <div className="absolute inset-0 animated-bg" />
        <div className="noise-overlay" />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative">
              <div className="h-14 w-14 rounded-full border-2 border-primary-500/20 border-t-primary-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Link2 className="h-5 w-5 text-primary-400" />
              </div>
            </div>
            <p className="text-sm text-white/50">Loading hub...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !hub) {
    return (
      <div className="min-h-screen bg-[color:var(--bg)] text-white relative overflow-hidden">
        <div className="absolute inset-0 animated-bg" />
        <div className="noise-overlay" />
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <Link2 className="h-8 w-8 text-white/30" />
            </div>
            <h1 className="text-2xl font-semibold text-white sm:text-3xl">Hub not found</h1>
            <p className="mt-3 text-sm text-white/50">
              {error || 'This hub does not exist or has been removed.'}
            </p>
            <Link href="/" className="btn-primary mt-6 inline-flex items-center justify-center">
              Go home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[color:var(--bg)] text-white relative overflow-hidden">
      <div className="absolute inset-0 animated-bg" />
      <div className="noise-overlay" />

      <div className="relative z-10 mx-auto w-full max-w-xl px-4 pb-16 pt-10 sm:pt-14">
        <motion.header
          className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-primary-500/30 blur-xl" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 text-xl font-bold text-black shadow-lg shadow-primary-500/30 ring-1 ring-primary-500/30 sm:h-16 sm:w-16">
                {hub.title.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Smart link hub</p>
              <h1 className="truncate text-2xl font-semibold leading-tight text-white sm:text-3xl">
                {hub.title}
              </h1>
              <p className="mt-1 text-xs text-white/40 font-mono">/u/{hub.slug}</p>
            </div>
          </div>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/70 transition-colors hover:border-primary-500/40 hover:bg-white/10 hover:text-white"
          >
            {copied ? <Check className="h-4 w-4 text-primary-400" /> : <Share2 className="h-4 w-4" />}
            <span className={copied ? 'text-primary-400' : ''}>{copied ? 'Copied' : 'Share'}</span>
          </button>
        </motion.header>

        {hub.description ? (
          <p className="mt-6 text-sm leading-relaxed text-white/60 sm:text-base">
            {hub.description}
          </p>
        ) : null}

        <div className="mt-8 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/40">
          <span>Links</span>
          <span>{links.length} total</span>
        </div>

        {links.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center">
            <p className="text-sm text-white/40">No links yet</p>
            <p className="mt-1 text-xs text-white/30">This hub will be updated soon.</p>
          </div>
        ) : (
          <motion.div
            className="mt-4 space-y-3"
            variants={listVariants}
            initial="hidden"
            animate="show"
          >
            {links.map((link) => (
              <motion.div key={link.id} variants={itemVariants}>
                <LinkCard
                  title={link.title}
                  url={link.url}
                  icon={link.icon}
                  onClick={() => handleLinkClick(link)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        <footer className="mt-16 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/30 transition-colors hover:text-primary-400"
          >
            <Link2 className="h-3 w-3" />
            SmartHub
          </Link>
        </footer>
      </div>
    </main>
  );
}
