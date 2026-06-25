'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (signInError) {
      let msg = signInError.message || JSON.stringify(signInError)
      if (typeof msg === 'string' && msg.toLowerCase().includes('invalid login credentials')) {
        msg = 'No account found or invalid credentials. Please sign up if you do not have an account.'
      }
      setError(typeof msg === 'object' ? JSON.stringify(msg) : msg)
      toast.error(msg)
      setLoading(false)
      return
    }

    toast.success('Successfully logged in!')
    router.push('/feed')
    router.refresh()
  }

  return (
    <main style={styles.page}>
      {/* ── Left: hero image panel ── */}
      <section className="hidden lg:block" style={styles.left}>
        <Image
          src="/login-image.png"
          alt="Team collaborating at Naba Sooq"
          fill
          priority
          style={{ objectFit: 'cover', objectPosition: 'center top' }}
        />
        {/* Dark overlay for text legibility */}
        <div style={styles.overlay} />

        {/* Brand text */}
        <div style={styles.heroText}>
          <span style={styles.heroTitle}>Naba Sooq</span>
          <p style={styles.heroSub}>
            Connect with friends and<br />
            the world around you on Naba Sooq.
          </p>
        </div>
      </section>

      {/* ── Right: form panel ── */}
      <section style={styles.right}>
        <div style={styles.formWrap}>
          {/* Card */}
          <div style={styles.card}>
            <form onSubmit={handleSubmit} style={styles.form}>
              {/* Email */}
              <input
                id="login-email"
                name="email"
                type="email"
                placeholder="Email address or username"
                value={form.email}
                onChange={handleChange}
                style={styles.input}
                required
                autoComplete="email"
              />

              {/* Password */}
              <input
                id="login-password"
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                style={styles.input}
                required
                autoComplete="current-password"
              />

              {error && <p style={styles.errorMsg}>{error}</p>}

              {/* Log In button */}
              <button
                id="login-submit"
                type="submit"
                style={{
                  ...styles.loginBtn,
                  opacity: loading ? 0.75 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
                disabled={loading}
              >
                {loading ? 'Logging in…' : 'Log In'}
              </button>
            </form>

            {/* Forgotten password */}
            <div style={styles.forgotWrap}>
              <Link href="#" style={styles.forgotLink}>
                Forgotten password?
              </Link>
            </div>

            {/* Divider */}
            <hr style={styles.divider} />

            {/* Create account */}
            <div style={styles.createWrap}>
              <Link href="/signup" style={styles.createBtn}>
                Create new account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

/* ─── Styles ─── */
const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    fontFamily: "'Inter', sans-serif",
  },

  /* ── Left panel ── */
  left: {
    position: 'relative',
    flex: '0 0 50%',
    overflow: 'hidden',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.30)',
    zIndex: 1,
  },
  heroText: {
    position: 'absolute',
    top: 48,
    left: 48,
    zIndex: 3,
  },
  heroTitle: {
    display: 'block',
    fontSize: 58,
    fontWeight: 800,
    color: '#1877f2',
    letterSpacing: '-1px',
    textShadow: '0 2px 12px rgba(0,0,0,0.25)',
    marginBottom: 14,
    lineHeight: 1,
  },
  heroSub: {
    fontSize: 28,
    fontWeight: 700,
    color: '#ffffff',
    lineHeight: 1.25,
    textShadow: '0 2px 10px rgba(0,0,0,0.5)',
    maxWidth: 500,
  },

  /* ── Right panel ── */
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    backgroundColor: '#f0f2f5',
  },
  formWrap: {
    width: '100%',
    maxWidth: 396,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
  },

  /* ── Card ── */
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    boxShadow: '0 2px 4px rgba(0,0,0,0.10), 0 8px 16px rgba(0,0,0,0.10)',
    padding: '20px 24px 28px',
    width: '100%',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    border: '1px solid #dddfe2',
    borderRadius: 6,
    fontSize: 17,
    color: '#1c1e21',
    backgroundColor: '#ffffff',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  },
  loginBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#1877f2',
    color: '#ffffff',
    border: 'none',
    borderRadius: 6,
    fontSize: 20,
    fontWeight: 700,
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
    marginTop: 4,
  },
  errorMsg: {
    color: '#fa3e3e',
    fontSize: 13,
    textAlign: 'center',
  },

  /* Forgotten password */
  forgotWrap: {
    textAlign: 'center',
    marginTop: 16,
    paddingBottom: 16,
  },
  forgotLink: {
    color: '#1877f2',
    fontSize: 14,
    textDecoration: 'none',
  },

  /* Divider */
  divider: {
    border: 'none',
    borderTop: '1px solid #dadde1',
    margin: '4px 0',
  },

  /* Create account button */
  createWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 20,
  },
  createBtn: {
    display: 'inline-block',
    backgroundColor: '#42b72a',
    color: '#ffffff',
    borderRadius: 6,
    padding: '14px 28px',
    fontSize: 17,
    fontWeight: 700,
    fontFamily: 'inherit',
    textDecoration: 'none',
    transition: 'background-color 0.15s',
  },

  /* Footer */
  footer: {
    fontSize: 14,
    color: '#1c1e21',
    textAlign: 'center',
  },
  footerLink: {
    fontWeight: 700,
    color: '#1c1e21',
    textDecoration: 'none',
  },
}
