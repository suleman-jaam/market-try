import Link from 'next/link'
import styles from '../info.module.css'

export default function AboutPage() {
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
          <h1 className={styles.title}>About Naba Sooq</h1>
          <p className={styles.subtitle}>Empowering global commerce.</p>
        </header>

        <div className={styles.content}>
          <p>Naba Sooq is a next-generation platform built for e-commerce entrepreneurs, dropshippers, and retail innovators around the globe.</p>
          
          <h2>Our Mission</h2>
          <p>We believe that anyone should be able to build a successful e-commerce business. Our mission is to connect sellers, share winning strategies, and provide a community-driven ecosystem for scaling global commerce operations.</p>

          <h2>What We Offer</h2>
          <ul>
            <li><strong>Community Feed:</strong> Share your recent successes, ask questions, and learn from top sellers.</li>
            <li><strong>Discovery:</strong> Find trending products, popular tags, and verified users who have proven track records in the industry.</li>
            <li><strong>Networking:</strong> Follow and befriend other entrepreneurs to build your professional network.</li>
          </ul>

          <h2>Get in Touch</h2>
          <p>If you have any questions, feedback, or partnership inquiries, feel free to reach out to our support team.</p>
        </div>
      </main>
    </div>
  )
}
