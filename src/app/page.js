import Link from 'next/link'
import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.main}>
      {/* Background glow orbs */}
      <div className={styles.orb1} />
      <div className={styles.orb2} />

      {/* Navbar */}
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⚡</span>
          <span className={styles.logoText}>SellerSpace</span>
        </div>
        <div className={styles.navLinks}>
          <Link href="/login" className={styles.navLogin}>Log in</Link>
          <Link href="/signup" className={styles.navSignup}>Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.badge}>
          🚀 Built for e-commerce sellers
        </div>
        <h1 className={styles.heroTitle}>
          The social network<br />
          <span className={styles.heroGradient}>built for sellers</span>
        </h1>
        <p className={styles.heroSub}>
          Connect with Amazon FBA, Shopify, Dropshipping, Etsy & TikTok Shop sellers.
          Share wins, strategies, and ideas with people who actually get it.
        </p>
        <div className={styles.heroCTA}>
          <Link href="/signup" className="btn-primary" style={{width: 'auto', padding: '14px 36px', fontSize: '16px'}}>
            Join for free →
          </Link>
          <Link href="/login" className="btn-secondary" style={{width: 'auto', padding: '14px 36px', fontSize: '16px'}}>
            Log in
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className={styles.features}>
        {[
          { icon: '🏷️', title: 'Niche communities', desc: 'Amazon FBA, Shopify, Dropshipping, Etsy, TikTok Shop — find your people.' },
          { icon: '💡', title: 'Share your wins', desc: 'Post your strategies, revenue milestones, and lessons learned.' },
          { icon: '🤝', title: 'Real connections', desc: 'Follow sellers you admire and build a network that actually helps you grow.' },
        ].map((f) => (
          <div key={f.title} className={styles.featureCard}>
            <div className={styles.featureIcon}>{f.icon}</div>
            <h3 className={styles.featureTitle}>{f.title}</h3>
            <p className={styles.featureDesc}>{f.desc}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
