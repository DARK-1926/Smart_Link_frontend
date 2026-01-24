'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Link2, Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/toast';

function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const { error: showError } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      router.push('/dashboard');
    } else {
      showError(result.error || 'Invalid credentials');
      setLoading(false);
    }
  }

  const fillDemo = () => {
    setEmail('demo@smartlinkhub.com');
    setPassword('demo123456');
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-white relative overflow-hidden px-4">
      <div className="absolute inset-0 animated-bg" />
      <div className="noise-overlay" />

      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <div className="w-full max-w-sm space-y-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Link2 className="h-5 w-5 text-black" />
            </div>
            <span className="text-lg font-semibold">SmartHub</span>
          </div>

          <div className="card-glow relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500/60 via-primary-400/40 to-primary-600/60" />
            <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
            <p className="mt-2 text-sm text-white/60">Log in to manage your smart link hubs.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="********"
                  required
                  minLength={8}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue'}
              </button>
            </form>

            <div className="divider" />

            <p className="text-sm text-white/50 text-center">
              No account?{' '}
              <Link href="/register" className="text-primary-300 hover:text-primary-200">
                Sign up
              </Link>
            </p>
          </div>

          <button
            onClick={fillDemo}
            className="w-full rounded-2xl border border-primary-500/30 bg-primary-500/10 px-4 py-3 text-left text-sm text-primary-200 transition-colors hover:border-primary-500/50 hover:bg-primary-500/15"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">Try the demo account</span>
              <span className="text-xs text-primary-300">Click to fill</span>
            </div>
            <p className="mt-2 text-xs text-white/50 font-mono">demo@smartlinkhub.com</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
