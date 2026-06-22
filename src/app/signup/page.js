'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from '../auth.module.css'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '', username: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (form.username.length < 3) {
      setError('Username must be at least 3 characters.')
      setLoading(false)
      return
    }

    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { username: form.username },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Create profile row
    if (data?.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        username: form.username,
        email: form.email,
      })
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.card}>
          <div className={styles.successIcon}>✉️</div>
          <h2 className={styles.title}>Check your email</h2>
          <p className={styles.subtitle}>
            We sent a confirmation link to <strong>{form.email}</strong>.
            Click it to activate your account.
          </p>
          <Link href="/login" className="btn-secondary" style={{ marginTop: '20px' }}>
            Go to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.orb1} />
      <div className={styles.orb2} />

      <div className={styles.card}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span>⚡</span> SellerSpace
        </Link>

        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>Join thousands of e-commerce sellers</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="signup-username" className={styles.label}>Username</label>
            <input
              id="signup-username"
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

          <div className={styles.field}>
            <label htmlFor="signup-email" className={styles.label}>Email</label>
            <input
              id="signup-email"
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

          <div className={styles.field}>
            <label htmlFor="signup-password" className={styles.label}>Password</label>
            <input
              id="signup-password"
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

          <button
            id="signup-submit"
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account →'}
          </button>
        </form>

        <p className={styles.switchLink}>
          Already have an account?{' '}
          <Link href="/login" className={styles.link}>Log in</Link>
        </p>
      </div>
    </div>
  )
}
