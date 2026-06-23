'use client'

import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import styles from './settings.module.css'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

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
              <div className={styles.settingDesc}>Choose how SellerSpace looks to you.</div>
            </div>

            <div className={styles.themeSelector}>
              <button
                className={styles.themeBtn}
                data-active={theme === 'light'}
                onClick={() => setTheme('light')}
              >
                Light
              </button>
              <button
                className={styles.themeBtn}
                data-active={theme === 'dark'}
                onClick={() => setTheme('dark')}
              >
                Dark
              </button>
              <button
                className={styles.themeBtn}
                data-active={theme === 'system'}
                onClick={() => setTheme('system')}
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
            <input type="checkbox" disabled />
          </div>
        </section>

      </main>
    </div>
  )
}
