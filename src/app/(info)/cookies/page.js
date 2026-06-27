import Link from 'next/link'
import styles from '../info.module.css'

export default function CookiesPage() {
  return (
    <div className={styles.layout}>
      <nav className={styles.navBar}>
        <Link href="/feed" className={styles.backBtn}>
          <span className="material-symbols-outlined sz-20">arrow_back</span>
          Back to Naba Sooq
        </Link>
      </nav>

      <main className={styles.mainColumn}>
        <header className={styles.header}>
          <h1 className={styles.title}>Cookie Policy</h1>
          <p className={styles.subtitle}>Last updated: June 27, 2026</p>
        </header>

        <div className={styles.content}>
          <p>This Cookie Policy explains how Naba Sooq uses cookies and similar technologies to recognize you when you visit our platform.</p>
          
          <h2>1. What are cookies?</h2>
          <p>Cookies are small data files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide reporting information.</p>

          <h2>2. Why do we use cookies?</h2>
          <ul>
            <li><strong>Essential Cookies:</strong> Required to maintain your logged-in session securely using Supabase Auth.</li>
            <li><strong>Functional Cookies:</strong> Used to remember your preferences and settings.</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how our platform is being used so we can improve the user experience.</li>
          </ul>

          <h2>3. Managing Cookies</h2>
          <p>You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting or amending your web browser controls to accept or refuse cookies.</p>
        </div>
      </main>
    </div>
  )
}
