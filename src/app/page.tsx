import Link from 'next/link';
import { ArrowRight, Link2, Clock, Smartphone, TrendingUp, Globe, Terminal, Eye, Zap } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-provider';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[color:var(--bg)] text-white relative overflow-hidden">
      <div className="absolute inset-0 animated-bg" />
      <div className="noise-overlay" />

      <div className="relative z-10">
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-white/5 backdrop-blur">
          <div className="container-wide flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Link2 className="w-4 h-4 text-black" />
              </div>
              <span className="font-semibold text-white tracking-tight">SmartHub</span>
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle subtle />
              <Link href="/login" className="btn-ghost text-sm">Log in</Link>
              <Link href="/dashboard" className="btn-primary text-sm inline-flex items-center gap-2">
                Build a hub
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </nav>

        <section className="container-wide py-16 lg:py-24">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary-300">
                IIT Ropar TechFest 2026
              </p>
              <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                The smart link hub that knows what to show first.
              </h1>
              <p className="mt-5 max-w-xl text-base text-white/60 sm:text-lg">
                Build a single link page that adapts to device, time, and performance. Keep your most
                important links front and center for every visitor.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/dashboard" className="btn-primary inline-flex items-center gap-2">
                  Start building
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/u/demo-hub" className="btn-secondary inline-flex items-center gap-2">
                  View demo hub
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-4 text-xs text-white/40">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary-400" />
                  Auto rules
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary-400" />
                  Live preview
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary-400" />
                  Analytics built in
                </div>
              </div>
            </div>

            <div className="card-glow relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500/60 via-primary-400/50 to-primary-600/60" />
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">Live rules preview</p>
                  <p className="mt-2 text-sm text-white/70">Mobile visitor | 2:14 PM | IN</p>
                </div>
                <span className="rounded-full border border-primary-500/30 bg-primary-500/10 px-3 py-1 text-xs font-semibold text-primary-300">
                  Demo
                </span>
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">Top link</p>
                  <p className="mt-2 text-sm font-semibold text-white">Download the mobile app</p>
                </div>
                <div className="space-y-2 text-sm text-white/60">
                  <p><span className="text-primary-300 font-semibold">App download</span> boosted for mobile users.</p>
                  <p><span className="text-primary-300 font-semibold">LinkedIn</span> ranked higher during work hours.</p>
                  <p><span className="text-primary-300 font-semibold">Top performer</span> pinned from last 7 days.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 py-16">
          <div className="container-wide">
            <SectionHeader
              kicker="Rule engine"
              title="Rules you can set in minutes"
              subtitle="Target different audiences without duplicating your links."
            />
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <RuleType
                icon={<Clock className="w-5 h-5" />}
                name="Time"
                desc="Adjust priorities throughout the day"
                example="Boost LinkedIn 9AM-6PM"
              />
              <RuleType
                icon={<Smartphone className="w-5 h-5" />}
                name="Device"
                desc="Personalize for mobile or desktop"
                example="Pin App Store on mobile"
              />
              <RuleType
                icon={<TrendingUp className="w-5 h-5" />}
                name="Performance"
                desc="Auto-promote what performs best"
                example="Top 2 by clicks +30"
              />
              <RuleType
                icon={<Globe className="w-5 h-5" />}
                name="Location"
                desc="Localize ordering by region"
                example="IN visitors: show local"
              />
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 py-16">
          <div className="container-wide">
            <SectionHeader
              kicker="Features"
              title="Everything you need for a smart hub"
              subtitle="Clean design, quick setup, and analytics that make sense."
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<Eye className="w-4 h-4" />}
                title="Live preview"
                desc="Test rules with simulated visitors before publishing."
              />
              <FeatureCard
                icon={<Terminal className="w-4 h-4" />}
                title="Explainable decisions"
                desc="See why each link ranks where it does."
              />
              <FeatureCard
                icon={<Zap className="w-4 h-4" />}
                title="Fast by default"
                desc="Caching and async logging built in."
              />
              <FeatureCard
                icon={<TrendingUp className="w-4 h-4" />}
                title="Analytics"
                desc="CTR, trends, and per-link performance."
              />
              <FeatureCard
                icon={<Link2 className="w-4 h-4" />}
                title="Simple sharing"
                desc="Clean public URLs with share-ready previews."
              />
              <FeatureCard
                icon={<Globe className="w-4 h-4" />}
                title="Privacy-aware"
                desc="Privacy-first analytics without personal data."
              />
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 py-16">
          <div className="container-narrow text-center">
            <div className="card-glow relative overflow-hidden p-10">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-transparent to-primary-500/10" />
              <div className="relative z-10">
                <p className="text-xs uppercase tracking-[0.2em] text-white/40">Ready to demo</p>
                <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">
                  Explore the demo hub
                </h2>
                <p className="mt-3 text-sm text-white/60">
                  No signup required. See the smart ordering in action.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link href="/u/demo-hub" className="btn-primary">
                    Open demo
                  </Link>
                  <Link href="/login" className="btn-secondary">
                    Log in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10 py-8">
          <div className="container-wide flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center">
                <Link2 className="w-3.5 h-3.5 text-black" />
              </div>
              <span className="text-sm text-white/50">SmartHub</span>
            </div>
            <p className="text-xs text-white/30">IIT Ropar TechFest 2026 - JPD Hub Hackathon</p>
          </div>
        </footer>
      </div>
    </main>
  );
}

function SectionHeader({ kicker, title, subtitle }: { kicker: string; title: string; subtitle: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-primary-300">{kicker}</p>
      <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">{title}</h2>
      <p className="mt-3 text-sm text-white/60 sm:text-base">{subtitle}</p>
    </div>
  );
}

function RuleType({ icon, name, desc, example }: { icon: React.ReactNode; name: string; desc: string; example: string }) {
  return (
    <div className="card group">
      <div className="flex items-center gap-3 text-white">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary-500/25 bg-primary-500/10 text-primary-300">
          {icon}
        </div>
        <span className="text-base font-semibold">{name}</span>
      </div>
      <p className="mt-4 text-sm text-white/60 leading-relaxed">{desc}</p>
      <div className="mt-4 inline-flex items-center rounded-full border border-primary-500/30 bg-primary-500/10 px-3 py-1 text-xs font-semibold text-primary-300">
        {example}
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="card">
      <div className="flex items-center gap-3 text-white">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary-500/20 bg-primary-500/10 text-primary-300">
          {icon}
        </div>
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <p className="mt-3 text-sm text-white/60 leading-relaxed">{desc}</p>
    </div>
  );
}
