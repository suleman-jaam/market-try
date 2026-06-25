'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)
const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 100 }, (_, i) => currentYear - i)

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    firstName: '',
    surname: '',
    email: '',
    password: '',
    day: '1',
    month: 'Jan',
    year: String(currentYear),
    gender: '',
  })
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

    if (!form.gender) {
      setError('Please select your gender.')
      setLoading(false)
      return
    }

    const monthIndex = MONTHS.indexOf(form.month)
    const birthDate = new Date(form.year, monthIndex, form.day)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    if (age < 15) {
      setError('You must be at least 15 years old to sign up.')
      setLoading(false)
      return
    }

    const randomSuffix = Math.random().toString(36).substring(2, 6)
    const generatedUsername = `${form.surname.toLowerCase()}-${randomSuffix}`

    const supabase = createClient()
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName,
          last_name: form.surname,
          full_name: `${form.firstName} ${form.surname}`,
          display_name: `${form.firstName} ${form.surname}`,
          username: generatedUsername,
          gender: form.gender,
          birthday: `${form.year}-${String(monthIndex + 1).padStart(2, '0')}-${String(form.day).padStart(2, '0')}`,
        },
      },
    })

    if (signUpError) {
      let msg = signUpError.message
      const lowerMsg = msg.toLowerCase()
      if (
        lowerMsg.includes('already registered') ||
        lowerMsg.includes('already in use') ||
        lowerMsg.includes('already exists')
      ) {
        msg = 'Account already exists. Please login.'
      }
      setError(msg)
      toast.error(msg)
      setLoading(false)
      return
    }

    // When email confirmations are enabled, Supabase returns a fake success response
    // but the user's identities array will be empty if the email already exists.
    if (signUpData?.user?.identities && signUpData.user.identities.length === 0) {
      const msg = 'Account already exists. Please login.'
      setError(msg)
      toast.error(msg)
      setLoading(false)
      return
    }

    toast.success('Account created! Please check your email to confirm.')
    router.push('/login')
  }

  return (
    <main style={styles.page}>
      {/* Left — hero image */}
      <section className="hidden lg:flex" style={styles.left}>
        <Image
          src="/signup-image.png"
          alt="People connecting on Naba Sooq"
          fill
          priority
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />
        {/* Subtle dark overlay for text legibility */}
        <div style={styles.overlay} />
        <div style={styles.heroText}>
          <span style={styles.heroTitle}>Naba Sooq</span>
          <p style={styles.heroSub}>
            Connect with friends and the world around you on Naba Sooq.
          </p>
        </div>
      </section>

      {/* Right — form */}
      <section style={styles.right}>
        <div style={styles.card}>
          <h1 style={styles.cardTitle}>Create a new account</h1>
          <p style={styles.cardSub}>It&apos;s quick and easy.</p>

          <hr style={styles.divider} />

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Name row */}
            <div style={styles.row}>
              <input
                id="signup-firstname"
                name="firstName"
                type="text"
                placeholder="First name"
                value={form.firstName}
                onChange={handleChange}
                style={styles.input}
                required
                autoComplete="given-name"
              />
              <input
                id="signup-surname"
                name="surname"
                type="text"
                placeholder="Surname"
                value={form.surname}
                onChange={handleChange}
                style={styles.input}
                required
                autoComplete="family-name"
              />
            </div>

            {/* Email */}
            <input
              id="signup-email"
              name="email"
              type="email"
              placeholder="Mobile number or email address"
              value={form.email}
              onChange={handleChange}
              style={styles.inputFull}
              required
              autoComplete="email"
            />

            {/* Password */}
            <input
              id="signup-password"
              name="password"
              type="password"
              placeholder="New password"
              value={form.password}
              onChange={handleChange}
              style={styles.inputFull}
              required
              autoComplete="new-password"
              minLength={6}
            />

            {/* Birthday */}
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>
                Birthday{' '}
                <span style={styles.infoIcon} title="Providing your birthday helps make sure you get the right Facebook experience for your age.">
                  ⓘ
                </span>
              </label>
              <div style={styles.row}>
                <select
                  id="signup-day"
                  name="day"
                  value={form.day}
                  onChange={handleChange}
                  style={styles.select}
                >
                  {DAYS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <select
                  id="signup-month"
                  name="month"
                  value={form.month}
                  onChange={handleChange}
                  style={styles.select}
                >
                  {MONTHS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <select
                  id="signup-year"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  style={styles.select}
                >
                  {YEARS.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Gender */}
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>
                Gender{' '}
                <span style={styles.infoIcon} title="You can change who can see your gender on your profile.">
                  ⓘ
                </span>
              </label>
              <div style={styles.genderRow}>
                {['Female', 'Male', 'Custom'].map(g => (
                  <label
                    key={g}
                    style={{
                      ...styles.genderOption,
                      borderColor: form.gender === g ? '#1877f2' : '#ccd0d5',
                    }}
                    htmlFor={`gender-${g.toLowerCase()}`}
                  >
                    <span style={styles.genderLabel}>{g}</span>
                    <input
                      id={`gender-${g.toLowerCase()}`}
                      type="radio"
                      name="gender"
                      value={g}
                      checked={form.gender === g}
                      onChange={handleChange}
                      style={styles.radio}
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Privacy notice */}
            <p style={styles.privacyNote}>
              People who use our service may have uploaded your contact information to Naba Sooq.{' '}
              <Link href="#" style={styles.blueLink}>Learn more.</Link>
            </p>

            <p style={styles.privacyNote}>
              By clicking Sign Up, you agree to our{' '}
              <Link href="#" style={styles.blueLink}>Terms</Link>,{' '}
              <Link href="#" style={styles.blueLink}>Privacy Policy</Link> and{' '}
              <Link href="#" style={styles.blueLink}>Cookies Policy</Link>.
              You may receive SMS notifications from us and can opt out at any time.
            </p>

            {error && <p style={styles.errorMsg}>{error}</p>}

            <div style={styles.submitWrap}>
              <button
                id="signup-submit"
                type="submit"
                style={{
                  ...styles.submitBtn,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </div>
          </form>

          <div style={styles.loginLinkWrap}>
            <Link href="/login" style={styles.loginLink}>
              Already have an account?
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

/* ─── Inline styles (mirrors login page approach, Facebook-style) ─── */
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
    flex: '0 0 58%',
    overflow: 'hidden',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.10) 100%)',
    zIndex: 1,
  },
  heroText: {
    position: 'absolute',
    top: 40,
    left: 44,
    zIndex: 3,
  },
  heroTitle: {
    display: 'block',
    fontSize: 50,
    fontWeight: 800,
    color: '#1877f2',
    letterSpacing: '-0.5px',
    textShadow: '0 2px 8px rgba(0,0,0,0.6)',
    marginBottom: 10,
  },
  heroSub: {
    fontSize: 30,
    fontWeight: 700,
    color: '#ffffff',
    maxWidth: 500,
    lineHeight: 1.2,
    textShadow: '0 2px 8px rgba(0,0,0,0.6)',
  },
  /* ── Right panel ── */
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    backgroundColor: '#f0f2f5',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1)',
    padding: '20px 24px 24px',
    width: '100%',
    maxWidth: 432,
  },
  cardTitle: {
    fontSize: 32,
    fontWeight: 700,
    color: '#1c1e21',
    lineHeight: 1.2,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 16,
    color: '#606770',
    marginBottom: 0,
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #dadde1',
    margin: '16px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  row: {
    display: 'flex',
    gap: 8,
  },
  input: {
    flex: '1 1 0',
    minWidth: 0,
    width: 0,
    boxSizing: 'border-box',
    padding: '14px 16px',
    border: '1px solid #dddfe2',
    borderRadius: 6,
    fontSize: 15,
    color: '#1c1e21',
    backgroundColor: '#ffffff',
    outline: 'none',
    fontFamily: 'inherit',
  },
  inputFull: {
    width: '100%',
    padding: '14px 16px',
    border: '1px solid #dddfe2',
    borderRadius: 6,
    fontSize: 15,
    color: '#1c1e21',
    backgroundColor: '#ffffff',
    outline: 'none',
    fontFamily: 'inherit',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#606770',
  },
  infoIcon: {
    color: '#8a8d91',
    fontSize: 13,
    cursor: 'help',
  },
  select: {
    flex: 1,
    padding: '10px 8px',
    border: '1px solid #dddfe2',
    borderRadius: 6,
    fontSize: 15,
    color: '#1c1e21',
    backgroundColor: '#ffffff',
    outline: 'none',
    fontFamily: 'inherit',
    cursor: 'pointer',
    appearance: 'auto',
  },
  genderRow: {
    display: 'flex',
    gap: 8,
  },
  genderOption: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    border: '1px solid #ccd0d5',
    borderRadius: 6,
    cursor: 'pointer',
    userSelect: 'none',
  },
  genderLabel: {
    fontSize: 15,
    color: '#1c1e21',
  },
  radio: {
    width: 18,
    height: 18,
    accentColor: '#1877f2',
    cursor: 'pointer',
  },
  privacyNote: {
    fontSize: 11,
    color: '#777',
    lineHeight: 1.5,
  },
  blueLink: {
    color: '#1877f2',
    textDecoration: 'none',
  },
  errorMsg: {
    color: '#fa3e3e',
    fontSize: 13,
    textAlign: 'center',
  },
  submitWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  submitBtn: {
    backgroundColor: '#42b72a',
    color: '#ffffff',
    border: 'none',
    borderRadius: 6,
    padding: '14px 80px',
    fontSize: 17,
    fontWeight: 700,
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  loginLinkWrap: {
    textAlign: 'center',
    marginTop: 16,
  },
  loginLink: {
    color: '#1877f2',
    fontSize: 14,
    fontWeight: 600,
    textDecoration: 'none',
  },
}
