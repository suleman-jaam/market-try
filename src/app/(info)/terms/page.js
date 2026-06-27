import Link from 'next/link'
import styles from '../info.module.css'

export default function TermsPage() {
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
          <h1 className={styles.title}>Terms of Service</h1>
          <p className={styles.subtitle}>Last updated: June 27, 2026</p>
        </header>

        <div className={styles.content}>
          <p>Welcome to Naba Sooq. By accessing or using our platform, you agree to be bound by these Terms of Service.</p>
          
          <h2>1. Use of the Platform</h2>
          <p>You must use Naba Sooq in compliance with all applicable laws and regulations. Any fraudulent, abusive, or otherwise illegal activity may be grounds for termination of your account.</p>

          <h2>2. User Content</h2>
          <p>You retain ownership of the content you post on Naba Sooq. By posting content, you grant us a non-exclusive, worldwide, royalty-free license to use, copy, reproduce, process, and display that content in connection with providing the services.</p>

          <h2>3. Prohibited Conduct</h2>
          <ul>
            <li>Spamming or aggressively manipulating the algorithm.</li>
            <li>Posting misleading or deceptive e-commerce strategies.</li>
            <li>Harassing or threatening other sellers.</li>
          </ul>

          <h2>4. Termination</h2>
          <p>We reserve the right to suspend or terminate your account at any time for any reason, with or without notice, if we believe you have violated these Terms.</p>
        </div>
      </main>
    </div>
  )
}
