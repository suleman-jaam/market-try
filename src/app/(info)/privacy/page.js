import Link from 'next/link'
import styles from '../info.module.css'

export default function PrivacyPage() {
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
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.subtitle}>Last updated: June 27, 2026</p>
        </header>

        <div className={styles.content}>
          <p>Your privacy is important to us. This Privacy Policy explains how Naba Sooq collects, uses, and shares your personal information.</p>
          
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as your username, email address, profile picture, and the posts or comments you create on our platform.</p>

          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To provide, maintain, and improve our services.</li>
            <li>To personalize your feed and recommendations.</li>
            <li>To communicate with you about updates and security alerts.</li>
          </ul>

          <h2>3. Sharing Your Information</h2>
          <p>We do not sell your personal data to third parties. We may share information with trusted service providers who help us operate our platform, or when required by law.</p>

          <h2>4. Data Security</h2>
          <p>We use industry-standard security measures (including Supabase RLS and secure database architecture) to protect your data from unauthorized access or disclosure.</p>
        </div>
      </main>
    </div>
  )
}
