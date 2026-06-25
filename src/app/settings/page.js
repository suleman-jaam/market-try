'use client'

import { useTheme } from 'next-themes'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import styles from './settings.module.css'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    toast.success(`Theme set to ${newTheme}`, {
      style: {
        borderRadius: '10px',
        background: 'var(--bg-surface)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border)',
      },
    })
  }

  if (!mounted) {
    return null
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/feed" className={styles.backLink}>← Back to Feed</Link>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>Settings</h1>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Appearance</h2>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <div className={styles.settingName}>Theme</div>
              <div className={styles.settingDesc}>Choose how Naba Sooq looks to you.</div>
            </div>

            <div className={styles.themeSelector}>
              <button
                className={styles.themeBtn}
                data-active={theme === 'light'}
                onClick={() => handleThemeChange('light')}
              >
                Light
              </button>
              <button
                className={styles.themeBtn}
                data-active={theme === 'dark'}
                onClick={() => handleThemeChange('dark')}
              >
                Dark
              </button>
              <button
                className={styles.themeBtn}
                data-active={theme === 'system'}
                onClick={() => handleThemeChange('system')}
              >
                System
              </button>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Profile Details (Coming Soon)</h2>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <div className={styles.settingName}>Username</div>
              <div className={styles.settingDesc}>Change your public display name.</div>
            </div>
            <button className="btn-secondary" style={{ width: 'auto' }} disabled>Edit</button>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <div className={styles.settingName}>Bio</div>
              <div className={styles.settingDesc}>Write a short bio about your e-commerce journey.</div>
            </div>
            <button className="btn-secondary" style={{ width: 'auto' }} disabled>Edit</button>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Notifications (Coming Soon)</h2>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <div className={styles.settingName}>Email Digest</div>
              <div className={styles.settingDesc}>Receive a weekly summary of top posts.</div>
            </div>
            <input type="checkbox" onChange={() => toast('Notifications are coming soon!', { icon: '🚧' })} />
          </div>
        </section>

      </main>
    </div>
  )
}
