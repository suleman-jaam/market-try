'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', username: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (form.username.length < 3) {
      setError('Username must be at least 3 characters.');
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { username: form.username } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data?.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        username: form.username,
        email: form.email,
      });
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-on-background">Check your email</h2>
            <p className="mt-2 text-on-surface-variant">
              We sent a confirmation link to <strong>{form.email}</strong>. Click it to activate your account.
            </p>
            <Link href="/login" className="mt-4 inline-block bg-primary-fixed-dim text-on-primary-fixed-variant px-4 py-2 rounded-lg">
              Go to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen bg-background">
      {/* Left side – hidden on small screens */}
      <section className="hidden lg:flex w-1/2 flex-col justify-center p-12 bg-primary-fixed relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg')" }}></div>
        <div className="relative z-10 flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
          <span className="font-display text-xl">GrowthPulse</span>
        </div>
        <div className="relative z-10 mt-12 max-w-md">
          <h1 className="font-display text-4xl text-on-primary-fixed drop-shadow">Connect with the world's best sellers.</h1>
          <div className="mt-6 inline-flex items-center gap-2 bg-surface/90 backdrop-blur-md px-4 py-2 rounded-full border border-outline-variant/30">
            <div className="flex -space-x-2">
              <img className="w-8 h-8 rounded-full border-2 border-surface" src="https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg" alt="" />
              <img className="w-8 h-8 rounded-full border-2 border-surface" src="https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg" alt="" />
              <div className="w-8 h-8 rounded-full border-2 border-surface bg-secondary-container flex items-center justify-center text-label-sm text-on-secondary-container">+</div>
            </div>
            <span className="text-label-md text-on-surface">Join 50k+ sellers today.</span>
          </div>
        </div>
      </section>

      {/* Right side – form */}
      <section className="flex w-full lg:w-1/2 items-center justify-center p-8 lg:p-12 bg-surface-lowest">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-on-background">Get Started</h2>
            <p className="text-on-surface-variant">Create an account to join the network.</p>
          </div>

          {/* Social buttons */}
          <div className="flex flex-col space-y-3">
            <button className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg border border-outline-variant bg-surface hover:bg-surface-container-low transition">
              {/* Google SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path></svg>
              Continue with Google
            </button>
            <button className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg border border-outline-variant bg-surface hover:bg-surface-container-low transition">
              <span className="material-symbols-outlined text-[#95BF47]" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_bag</span>
              Continue with Shopify
            </button>
            <button className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg border border-outline-variant bg-surface hover:bg-surface-container-low transition">
              <span className="material-symbols-outlined text-[#FF9900]" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
              Continue with Amazon
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-outline-variant/50"></div>
            <span className="text-body-sm text-on-surface-variant">or</span>
            <div className="flex-1 h-px bg-outline-variant/50"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-label-md text-on-surface-variant mb-1">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="yourhandle"
                value={form.username}
                onChange={handleChange}
                className="input-field"
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-label-md text-on-surface-variant mb-1">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className="input-field"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-label-md text-on-surface-variant mb-1">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                className="input-field"
                required
                autoComplete="new-password"
              />
            </div>
            {error && <p className="error-msg">{error}</p>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account →'}
            </button>
          </form>

          <p className="text-center text-body-sm text-on-surface-variant">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:text-primary-fixed-dim transition">Log in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
