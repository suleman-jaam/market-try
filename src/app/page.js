import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import styles from './page.module.css'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const destination = user ? '/feed' : '/signup'

  return (
    <main className={styles.main}>
      {/* Navbar */}
      <nav className={styles.nav}>
        <div className={styles.navLeft}>
          <Link href="/" className={styles.logo}>
            GrowthPulse
          </Link>
          <div className={styles.navLinksDesktop}>
            <Link href="/" className={styles.navLinkActive}>Home</Link>
            <Link href="/discover" className={styles.navLink}>Discover</Link>
            <Link href="/notifications" className={styles.navLink}>Notifications</Link>
            <Link href="/profile" className={styles.navLink}>Profile</Link>
          </div>
        </div>
        <div className={styles.navRight}>
          <Link href={destination} className={styles.postBtn}>
            Post
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            The Global Town Square for E-commerce Sellers.
          </h1>
          <p className={styles.heroSubtitle}>
            Share strategies, track trends, and grow your store with a community that gets it. Join the fastest-growing network of successful online merchants.
          </p>
          <div className={styles.heroButtons}>
            <Link href={destination} className={styles.btnPrimary}>
              Start Your Growth Journey
            </Link>
            <Link href={destination} className={styles.btnSecondary}>
              Explore Communities
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresGrid}>
          {/* Card 1 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrap} style={{ background: '#EEF2FF', color: '#4F46E5' }}>
              <span className="material-symbols-outlined">trending_up</span>
            </div>
            <h3 className={styles.featureTitle}>Real-Time Trends</h3>
            <p className={styles.featureDesc}>
              Stay ahead of the curve. Spot viral products and emerging market shifts before they saturate.
            </p>
          </div>

          {/* Card 2 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrap} style={{ background: '#ECFDF5', color: '#10B981' }}>
              <span className="material-symbols-outlined">hub</span>
            </div>
            <h3 className={styles.featureTitle}>Platform Guilds</h3>
            <p className={styles.featureDesc}>
              Deep-dive communities for Amazon FBA, Shopify, and Etsy. Strategies tailored to your exact ecosystem.
            </p>
          </div>

          {/* Card 3 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrap} style={{ background: '#FFFBEB', color: '#D97706' }}>
              <span className="material-symbols-outlined">verified_user</span>
            </div>
            <h3 className={styles.featureTitle}>Verified Networking</h3>
            <p className={styles.featureDesc}>
              Connect with peers. Profiles verified by actual store revenue to ensure high-signal discussions.
            </p>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className={styles.trendingSection}>
        <div className={styles.trendingHeader}>
          <h2 className={styles.trendingTitle}>Trending from Top Sellers</h2>
          <p className={styles.trendingSubtitle}>Real insights shared today in the global town square.</p>
        </div>

        <div className={styles.trendingFeed}>
          {/* Mock Post 1 */}
          <article className={styles.mockPost}>
            <div className={styles.mockPostHeader}>
              <div className={styles.mockPostAvatar}>
                <img src="https://i.pravatar.cc/150?u=sarah" alt="Sarah Jenkins" />
              </div>
              <div className={styles.mockPostMeta}>
                <div className={styles.mockPostAuthor}>
                  <span className={styles.mockPostName}>Sarah Jenkins</span>
                  <span className={styles.mockPostHandle}>@sarahj_stores</span>
                  <span className={styles.mockPostDot}>·</span>
                  <span className={styles.mockPostTime}>2h</span>
                </div>
              </div>
              <div className={styles.mockPostBadge} style={{ background: '#ECFDF5', color: '#10B981' }}>
                SHOPIFY VERIFIED
              </div>
            </div>
            <p className={styles.mockPostContent}>
              Just A/B tested our checkout flow. Changing the CTA button from "Buy Now" to "Secure Checkout" increased conversion by 14% over the weekend. Don't underestimate trust signals! 🛒📈
            </p>
            <div className={styles.mockPostActions}>
              <div className={styles.mockPostAction}>
                <span className="material-symbols-outlined">chat_bubble</span> 42
              </div>
              <div className={styles.mockPostAction}>
                <span className="material-symbols-outlined">repeat</span> 12
              </div>
              <div className={styles.mockPostAction}>
                <span className="material-symbols-outlined">favorite</span> 284
              </div>
              <Link href={destination} className={styles.mockPostLink}>View Thread →</Link>
            </div>
          </article>

          {/* Mock Post 2 */}
          <article className={styles.mockPost}>
            <div className={styles.mockPostHeader}>
              <div className={styles.mockPostAvatar}>
                <img src="https://i.pravatar.cc/150?u=marcus" alt="Marcus Chen" />
              </div>
              <div className={styles.mockPostMeta}>
                <div className={styles.mockPostAuthor}>
                  <span className={styles.mockPostName}>Marcus Chen</span>
                  <span className={styles.mockPostHandle}>@mchen_fba</span>
                  <span className={styles.mockPostDot}>·</span>
                  <span className={styles.mockPostTime}>5h</span>
                </div>
              </div>
              <div className={styles.mockPostBadge} style={{ background: '#EEF2FF', color: '#4F46E5' }}>
                AMAZON FBA
              </div>
            </div>
            <p className={styles.mockPostContent}>
              Shipping costs are eating margins this Q3. Who else is restructuring their 3PL strategy before the holiday rush? I've put together a breakdown of 5 alternatives we're looking at.
            </p>
            <div className={styles.mockPostImage}>
              {/* CSS gradient placeholder for the chart */}
              <div className={styles.chartPlaceholder}></div>
            </div>
            <div className={styles.mockPostActions}>
              <div className={styles.mockPostAction}>
                <span className="material-symbols-outlined">chat_bubble</span> 156
              </div>
              <div className={styles.mockPostAction}>
                <span className="material-symbols-outlined">repeat</span> 89
              </div>
              <div className={styles.mockPostAction}>
                <span className="material-symbols-outlined">favorite</span> 892
              </div>
              <Link href={destination} className={styles.mockPostLink}>View Thread →</Link>
            </div>
          </article>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLeft}>
            <span className={styles.footerLogo}>GrowthPulse</span>
          </div>
          <div className={styles.footerLinks}>
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link>
            <Link href="#">Seller Guidelines</Link>
            <Link href="#">Help Center</Link>
          </div>
          <div className={styles.footerCopyright}>
            © 2024 GrowthPulse Social Commerce. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  )
}
