import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import PostForm from '@/components/PostForm'
import Post from '@/components/Post'
import styles from './feed.module.css'

const CATEGORIES = ['Amazon FBA', 'Shopify', 'Dropshipping', 'Etsy', 'TikTok Shop']

export default async function FeedPage({ searchParams }) {
  const params = await searchParams
  const activeTab = params.tab === 'following' ? 'following' : 'for-you'
  const activeCategory = params.category || null

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get or auto-create user profile
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

  // Build base query helper
  const buildQuery = (query) => {
    if (activeCategory) query = query.eq('category', activeCategory)
    return query.order('created_at', { ascending: false })
  }

  let posts = []

  if (activeTab === 'for-you') {
    const { data } = await buildQuery(
      supabase.from('posts')
        .select('*, profiles(username, avatar_url), likes(user_id), comments(*, profiles(username, avatar_url))')
    )
    posts = data || []
  } else {
    const { data: follows } = await supabase
      .from('follows').select('following_id').eq('follower_id', user.id)

    const followingIds = follows ? follows.map(f => f.following_id) : []
    const userIdsToFetch = [...followingIds, user.id]

    const { data } = await buildQuery(
      supabase.from('posts')
        .select('*, profiles(username, avatar_url), likes(user_id), comments(*, profiles(username, avatar_url))')
        .in('user_id', userIdsToFetch)
    )
    posts = data || []
  }

  // Build URL helpers preserving tab/category state
  const tabUrl = (tab) => {
    const p = new URLSearchParams()
    p.set('tab', tab)
    if (activeCategory) p.set('category', activeCategory)
    return `/feed?${p.toString()}`
  }

  const categoryUrl = (cat) => {
    const p = new URLSearchParams()
    p.set('tab', activeTab)
    if (cat) p.set('category', cat)
    return `/feed?${p.toString()}`
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span>⚡</span> SellerSpace
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link href={`/${profile?.username}`} className={styles.profileLink}>
            @{profile?.username}
          </Link>
          <form action={async () => {
            'use server'
            const { createClient } = await import('@/lib/supabase/server')
            const supabase = await createClient()
            await supabase.auth.signOut()
            const { redirect } = await import('next/navigation')
            redirect('/login')
          }}>
            <button type="submit" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
              Logout
            </button>
          </form>
        </div>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>Home Feed</h1>
        <p className={styles.subtitle}>Welcome back, {profile?.username}</p>

        <PostForm userId={user.id} />

        {/* Feed Tabs */}
        <div className={styles.tabs}>
          <Link href={tabUrl('for-you')} className={`${styles.tab} ${activeTab === 'for-you' ? styles.activeTab : ''}`}>
            For You
          </Link>
          <Link href={tabUrl('following')} className={`${styles.tab} ${activeTab === 'following' ? styles.activeTab : ''}`}>
            Following
          </Link>
        </div>

        {/* Category Filters */}
        <div className={styles.filters}>
          <Link href={categoryUrl(null)} className={`${styles.filterBtn} ${!activeCategory ? styles.activeFilter : ''}`}>
            All
          </Link>
          {CATEGORIES.map(cat => (
            <Link
              key={cat}
              href={categoryUrl(cat)}
              className={`${styles.filterBtn} ${activeCategory === cat ? styles.activeFilter : ''}`}
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Posts */}
        <div>
          {posts.length > 0 ? (
            posts.map(post => <Post key={post.id} post={post} currentUserId={user.id} />)
          ) : (
            <div className={styles.placeholder}>
              <p>
                {activeTab === 'following'
                  ? "No posts from people you follow yet. Try the 'For You' tab!"
                  : activeCategory
                    ? `No ${activeCategory} posts yet. Be the first to share!`
                    : 'No posts yet. Be the first to share your strategy!'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
