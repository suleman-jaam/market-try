'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import styles from './RightPanel.module.css'

const SUGGESTIONS = [
  { name: 'TechGear Pro', handle: 'techgear_official', category: 'Shopify', verified: true },
  { name: "Sarah's Finds", handle: 'sarahfinds', category: 'Amazon FBA', verified: false },
  { name: 'Drop King', handle: 'dropking_co', category: 'Dropshipping', verified: false },
]

export default function RightPanel() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [trendingTags, setTrendingTags] = useState([])

  useEffect(() => {
    async function fetchTags() {
      const supabase = createClient()
      const { data: tagsData } = await supabase.from('tags').select('name, post_tags(id)')
      let tags = (tagsData || [])
        .map(t => ({ tag: t.name, count: t.post_tags.length }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      if (tags.length === 0) {
        tags = [
          { tag: 'amazonfba', count: 0 },
          { tag: 'shopify', count: 0 },
          { tag: 'ecommerce', count: 0 }
        ]
      }
      setTrendingTags(tags)
    }
    fetchTags()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <aside className={styles.panel}>
      {/* Search */}
      <form className={styles.searchWrap} onSubmit={handleSearch}>
        <span className={`material-symbols-outlined sz-18 ${styles.searchIcon}`}>search</span>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search Naba Sooq"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      {/* Trending */}
      <div className={styles.widget}>
        <h2 className={styles.widgetTitle}>Trending Topics</h2>
        {trendingTags.map((t, i) => (
          <Link key={i} href={`/feed?tag=${encodeURIComponent(t.tag.toLowerCase())}`} className={styles.trendRow}>
            <div className={styles.trendMeta}>
              <span className={styles.trendTag}>{t.tag}</span>
              <span className={styles.trendPosts}>{t.count} posts</span>
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
            <button
              className={styles.followBtn}
              onClick={() => toast.success(`Started following @${s.handle}`)}
            >
              Follow
            </button>
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
        <span>© 2026 Naba Sooq</span>
      </div>
    </aside>
  )
}
