'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Link2, Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/toast';

function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const { error: showError } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    setLoading(true);

    const result = await register(email, password);

    if (result.success) {
      router.push('/dashboard');
    } else {
      showError(result.error || 'Registration failed');
      setLoading(false);
    }
  }

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
            <h1 className="text-2xl font-semibold text-white">Create your account</h1>
            <p className="mt-2 text-sm text-white/60">Launch your first smart hub in minutes.</p>

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
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Confirm password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create account'}
              </button>
            </form>

            <div className="divider" />

            <p className="text-sm text-white/50 text-center">
              Already have an account?{' '}
              <Link href="/login" className="text-primary-300 hover:text-primary-200">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <AuthProvider>
      <RegisterForm />
    </AuthProvider>
  );
}
