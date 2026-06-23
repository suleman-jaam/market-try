import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import Post from '@/components/Post'
import Sidebar from '@/components/Sidebar'
import styles from './search.module.css'

const TRENDING_TAGS = ['#Dropshipping', '#ShopifyTips', '#ProductSourcing', '#EtsySuccess', '#Q4Prep']

export default async function SearchPage({ searchParams }) {
  const params = await searchParams
  const query = params.q || ''
  const filter = params.filter || 'all'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  let { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  if (!profile) {
    const { data: newProfile } = await supabase.from('profiles').insert({
      id: user.id,
      username: user.user_metadata?.username || `user_${user.id.substring(0, 6)}`,
      email: user.email,
    }).select().single()
    profile = newProfile
  }

  let users = []
  let posts = []

  if (query) {
    // Search users by username
    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${query}%`)
      .limit(10)

    users = usersData || []

    // Search posts by content
    const { data: postsData } = await supabase
      .from('posts')
      .select('*, profiles(username, avatar_url), likes(user_id), comments(*, profiles(username, avatar_url))')
      .ilike('content', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20)

    posts = postsData || []
  } else {
    // Show recent posts as "Explore" when there's no query
    const { data: explorePosts } = await supabase
      .from('posts')
      .select('*, profiles(username, avatar_url), likes(user_id), comments(*, profiles(username, avatar_url))')
      .order('created_at', { ascending: false })
      .limit(20)

    posts = explorePosts || []
  }

  return (
    <div className={styles.layout}>
      {/* Left Sidebar */}
      <Sidebar profile={profile} />

      {/* Main Feed */}
      <main className={styles.mainFeed}>
        {/* Discovery Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>Discovery</h1>
          <p className={styles.subtitle}>
            Find winning products, master new platforms, and scale your global commerce business.
          </p>

          {/* Search Bar */}
          <form action="/search" method="GET" className={styles.searchWrap}>
            <span className={`material-symbols-outlined sz-20 ${styles.searchIcon}`}>search</span>
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search platforms, products, or strategies..."
              className={styles.searchInput}
            />
          </form>

          {/* Filters */}
          <div className={styles.filters}>
            <span className={styles.filterLabel}>Filters:</span>
            <Link
              href={`/search?q=${encodeURIComponent(query)}&filter=friends`}
              className={`${styles.filterChip} ${filter === 'friends' ? '' : styles.filterChipOutline}`}
            >
              <span className="material-symbols-outlined sz-16">group</span>
              Friends Only
            </Link>
            <Link
              href={`/search?q=${encodeURIComponent(query)}&filter=verified`}
              className={`${styles.filterChip} ${filter === 'verified' ? '' : styles.filterChipOutline}`}
            >
              <span className="material-symbols-outlined sz-16">verified</span>
              Verified Users
            </Link>
            <Link
              href={`/search?q=${encodeURIComponent(query)}&filter=date`}
              className={`${styles.filterChip} ${filter === 'date' ? '' : styles.filterChipOutline}`}
            >
              <span className="material-symbols-outlined sz-16">schedule</span>
              Date
            </Link>
            <Link
              href={`/search?q=${encodeURIComponent(query)}&filter=tags`}
              className={`${styles.filterChip} ${filter === 'tags' ? '' : styles.filterChipOutline}`}
            >
              Tags
            </Link>
          </div>
        </header>

        {/* Search Results - Users */}
        {query && users.length > 0 && (
          <div className={styles.usersSection}>
            <h3 className={styles.sectionTitle}>Users</h3>
            <div className={styles.userGrid}>
              {users.map(u => (
                <Link key={u.id} href={`/${u.username}`} className={styles.userCard}>
                  <div className={styles.avatar}>
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt={u.username} className={styles.avatarImg} />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className={styles.userInfo}>
                    <div className={styles.username}>@{u.username}</div>
                    <div className={styles.bio}>{u.bio || 'E-commerce seller'}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Feed Posts */}
        <div className={styles.postList}>
          {posts.length > 0 ? (
            posts.map(post => (
              <Post key={post.id} post={post} currentUserId={user.id} />
            ))
          ) : (
            <div className={styles.emptyState}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.4 }}>explore</span>
              <h3>No posts to discover</h3>
              <p>{query ? `No results for "${query}". Try a different search.` : 'Be the first to start a conversation!'}</p>
            </div>
          )}
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className={styles.rightPanel}>
        {/* Trending Topics Widget */}
        <div className={styles.widget}>
          <div className={styles.widgetHeader}>
            <h2 className={styles.widgetTitle}>Trending Topics</h2>
          </div>
          <div className={styles.widgetBody}>
            <div className={styles.tagsWrap}>
              {TRENDING_TAGS.map((tag, i) => (
                <Link
                  key={i}
                  href={`/feed?tag=${encodeURIComponent(tag.substring(1).toLowerCase())}`}
                  className={styles.tagPill}
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footerLinks}>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Seller Guidelines</a>
          <a href="#">Help Center</a>
          <span>© 2026 GrowthPulse</span>
        </div>
      </aside>
    </div>
  )
}
