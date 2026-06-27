'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import styles from './RightPanel.module.css'

import FollowButton from '@/components/FollowButton'

export default function RightPanel() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [trendingTags, setTrendingTags] = useState([])
  const [suggestedUsers, setSuggestedUsers] = useState([])
  const [currentUserId, setCurrentUserId] = useState(null)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      // Fetch trending tags
      const { data: postTagsData } = await supabase.from('post_tags').select('tag_id, tags(name)')
      
      const tagCounts = {}
      if (postTagsData) {
        postTagsData.forEach(pt => {
          if (pt.tags?.name) {
            tagCounts[pt.tags.name] = (tagCounts[pt.tags.name] || 0) + 1
          }
        })
      }
      
      let tags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
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

      // Fetch current user and their follows
      const { data: { user } } = await supabase.auth.getUser()
      let followedIds = []
      
      if (user) {
        setCurrentUserId(user.id)
        
        // Fetch IDs the user already follows
        const { data: follows } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id)
        
        if (follows) {
          followedIds = follows.map(f => f.following_id)
        }
      }

      // Fetch who to follow based on seller_score
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('seller_score', { ascending: false, nullsFirst: false })
        .limit(10) // fetch more so we have enough after filtering
      
      // Filter out the current user and anyone they already follow
      const toSuggest = (usersData || [])
        .filter(u => u.id !== user?.id && !followedIds.includes(u.id))
        .slice(0, 3)
      setSuggestedUsers(toSuggest)
    }
    fetchData()
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
          <Link key={i} href={`/feed?tag=${encodeURIComponent(t.tag.replace(/^#/, '').toLowerCase())}`} className={styles.trendRow}>
            <div className={styles.trendMeta}>
              <span className={styles.trendTag}>#{t.tag.replace(/^#/, '')}</span>
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
        {suggestedUsers.map((u, i) => {
          const displayName = (u.first_name && u.last_name) 
            ? `${u.first_name} ${u.last_name}` 
            : (u.display_name || u.username)
          return (
            <div key={i} className={styles.suggRow}>
              <Link href={`/@${u.username}`} className={styles.suggAvatar} style={{ textDecoration: 'none' }}>
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt={u.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <span>{displayName.charAt(0).toUpperCase()}</span>
                )}
              </Link>
              <div className={styles.suggInfo}>
                <Link href={`/@${u.username}`} className={styles.suggName} style={{ textDecoration: 'none' }}>
                  {displayName}
                </Link>
                <div className={styles.suggHandle}>@{u.username}</div>
              </div>
              <FollowButton 
                targetUserId={u.id} 
                currentUserId={currentUserId} 
                initialIsFollowing={false} 
              />
            </div>
          )
        })}
        <Link href="/search" className={styles.showMore}>Show more</Link>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <Link href="/terms">Terms</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/cookies">Cookies</Link>
        <Link href="/about">About</Link>
        <span>© 2026 Naba Sooq</span>
      </div>
    </aside>
  )
}
