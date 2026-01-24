'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Link2, LayoutDashboard, LogOut, Loader2, Menu, X, ExternalLink } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-provider';
import { AuthProvider, useAuth } from '@/lib/auth-context';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (isLoading) {
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
            <p className="text-sm text-white/50">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-white relative overflow-hidden">
      <div className="absolute inset-0 animated-bg" />
      <div className="noise-overlay" />

      <div className="relative z-10">
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-white/5 backdrop-blur">
          <div className="flex h-14 items-center justify-between px-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Link2 className="h-4 w-4 text-black" />
              </div>
              <span className="text-sm font-semibold">SmartHub</span>
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle subtle />
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-white/60 hover:text-white"
                aria-label="Toggle menu"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed top-0 left-0 z-50 h-full w-64 border-r border-white/10 bg-white/5 backdrop-blur transition-transform duration-200 lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-white/10 p-5">
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                  <Link2 className="h-5 w-5 text-black" />
                </div>
                <span className="font-semibold">SmartHub</span>
              </Link>
              <div className="mt-4">
                <ThemeToggle />
              </div>
            </div>

            <nav className="flex-1 p-4">
              <Link
                href="/dashboard"
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  pathname === '/dashboard'
                    ? 'bg-primary-500/15 text-primary-300 border border-primary-500/30'
                    : 'text-white/60 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Hubs
              </Link>

              <div className="mt-8 px-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/30 mb-3">Quick links</p>
                <a
                  href="/u/demo-hub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:text-primary-300 hover:bg-white/5"
                >
                  Demo hub
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </nav>

            <div className="border-t border-white/10 p-3">
              <div className="flex items-center gap-3 px-3 py-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary-300">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="mt-2 flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white/60 transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </div>
        </aside>

        <main className="min-h-screen pt-14 lg:ml-64 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </AuthProvider>
  );
}
