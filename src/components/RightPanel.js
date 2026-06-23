import Link from 'next/link'
import styles from './RightPanel.module.css'

const TRENDING = [
  { tag: '#AmazonPrimeDay', posts: '48.2K posts', category: 'Amazon FBA' },
  { tag: '#ShopifyDropship', posts: '21.5K posts', category: 'Shopify' },
  { tag: '#Q3Targets', posts: '14.8K posts', category: 'General' },
  { tag: '#FBAProfit', posts: '9.3K posts', category: 'Amazon FBA' },
  { tag: '#TikTokSellers', posts: '7.1K posts', category: 'TikTok Shop' },
]

const SUGGESTIONS = [
  { name: 'TechGear Pro', handle: 'techgear_official', category: 'Shopify', verified: true },
  { name: "Sarah's Finds",   handle: 'sarahfinds',         category: 'Amazon FBA', verified: false },
  { name: 'Drop King',       handle: 'dropking_co',        category: 'Dropshipping', verified: false },
]

export default function RightPanel() {
  return (
    <aside className={styles.panel}>
      {/* Search */}
      <div className={styles.searchWrap}>
        <span className={`material-symbols-outlined sz-18 ${styles.searchIcon}`}>search</span>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search GrowthPulse"
        />
      </div>

      {/* Trending */}
      <div className={styles.widget}>
        <h2 className={styles.widgetTitle}>Trending for sellers</h2>
        {TRENDING.map((t, i) => (
          <Link key={i} href={`/feed?tag=${encodeURIComponent(t.tag.substring(1).toLowerCase())}`} className={styles.trendRow}>
            <div className={styles.trendMeta}>
              <span className={styles.trendCategory}>Trending</span>
              <span className={styles.trendTag}>{t.tag}</span>
              <span className={styles.trendPosts}>{t.posts}</span>
            </div>
            <button className={styles.moreBtn}>
              <span className="material-symbols-outlined sz-18">more_horiz</span>
            </button>
          </Link>
        ))}
        <Link href="/search" className={styles.showMore}>Show more</Link>
      </div>

      {/* Who to Follow */}
      <div className={styles.widget}>
        <h2 className={styles.widgetTitle}>Who to follow</h2>
        {SUGGESTIONS.map((s, i) => (
          <div key={i} className={styles.suggRow}>
            <div className={styles.suggAvatar}>
              <span>{s.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className={styles.suggInfo}>
              <div className={styles.suggName}>
                {s.name}
                {s.verified && (
                  <span className="material-symbols-outlined fill sz-16" style={{ color: 'var(--primary)', marginLeft: 4 }}>
                    verified
                  </span>
                )}
              </div>
              <div className={styles.suggHandle}>@{s.handle}</div>
            </div>
            <button className={styles.followBtn}>Follow</button>
          </div>
        ))}
        <Link href="/search" className={styles.showMore}>Show more</Link>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <Link href="#">Terms</Link>
        <Link href="#">Privacy</Link>
        <Link href="#">Cookies</Link>
        <Link href="#">About</Link>
        <span>© 2026 GrowthPulse</span>
      </div>
    </aside>
  )
}
