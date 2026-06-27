import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import Post from '@/components/Post'
import Sidebar from '@/components/Sidebar'
import RightPanel from '@/components/RightPanel'
import SearchBar from '@/components/SearchBar'
import styles from './search.module.css'

export const dynamic = 'force-dynamic'



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

  // Pre-fetch following list if needed for "Friends Only" filter
  let followedIds = []
  if (filter === 'friends') {
    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)
    followedIds = (follows || []).map(f => f.following_id)
  }

  const startDate = params.startDate || ''
  const endDate = params.endDate || ''

  let users = []
  let posts = []

  // Always build a posts query
  let postsQuery = supabase
    .from('posts')
    .select('*, profiles!posts_user_id_fkey(username, avatar_url, display_name, seller_score), likes(user_id), comments(*, profiles(username, avatar_url))')

  if (query) {
    // Search users by username
    let usersQuery = supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${query}%`)
      .limit(10)

    if (filter === 'verified') {
      usersQuery = usersQuery.gte('seller_score', 100)
    } else if (filter === 'friends') {
      if (followedIds.length === 0) usersQuery = usersQuery.in('id', [user.id])
      else usersQuery = usersQuery.in('id', followedIds)
    }

    const { data: usersData } = await usersQuery
    users = usersData || []

    // Find tags matching query
    const { data: matchedTags } = await supabase.from('tags').select('id').ilike('name', `%${query}%`)
    let postIdsFromTags = []
    if (matchedTags?.length > 0) {
      const { data: postTags } = await supabase.from('post_tags').select('post_id').in('tag_id', matchedTags.map(t => t.id))
      postIdsFromTags = (postTags || []).map(pt => pt.post_id)
    }

    // Apply content or tag ID search
    if (postIdsFromTags.length > 0) {
      postsQuery = postsQuery.or(`content.ilike.%${query}%,id.in.(${postIdsFromTags.join(',')})`)
    } else {
      postsQuery = postsQuery.ilike('content', `%${query}%`)
    }
  }

  // Apply Date Range
  if (startDate) {
    postsQuery = postsQuery.gte('created_at', new Date(startDate).toISOString())
  }
  if (endDate) {
    const end = new Date(endDate)
    end.setUTCHours(23, 59, 59, 999)
    postsQuery = postsQuery.lte('created_at', end.toISOString())
  }

  // Apply other filters
  if (filter === 'date') {
    postsQuery = postsQuery.order('created_at', { ascending: true })
  } else {
    postsQuery = postsQuery.order('created_at', { ascending: false })
  }

  postsQuery = postsQuery.limit(20)
  const { data: postsData } = await postsQuery
  posts = postsData || []

  if (filter === 'verified') {
    posts = posts.filter(p => p.profiles?.seller_score >= 100)
  } else if (filter === 'friends') {
    posts = posts.filter(p => followedIds.includes(p.user_id))
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

          <SearchBar
            initialQuery={query}
            initialFilter={filter}
            initialStartDate={startDate}
            initialEndDate={endDate}
          />
        </header>

        {/* Search Results - Users */}
        {query && users.length > 0 && (
          <div className={styles.usersSection}>
            <h3 className={styles.sectionTitle}>Users</h3>
            <div className={styles.userGrid}>
              {users.map(u => (
                <Link key={u.id} href={`/@${u.username}`} className={styles.userCard}>
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
      <RightPanel />
    </div>
  )
}
