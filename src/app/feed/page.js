import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import PostForm from '@/components/PostForm'
import Post from '@/components/Post'
import Sidebar from '@/components/Sidebar'
import RightPanel from '@/components/RightPanel'
import styles from './feed.module.css'

export default async function FeedPage({ searchParams }) {
  const params = await searchParams
  const activeTab = params.tab === 'following' ? 'following' : 'for-you'
  const activeTag = params.tag ? params.tag.toLowerCase() : null

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get or auto-create user profile
  let { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  if (!profile) {
    const { data: newProfile, error } = await supabase.from('profiles').insert({
      id: user.id,
      username: user.user_metadata?.username || `user_${user.id.substring(0, 6)}`,
      email: user.email,
    }).select().single()
    
    if (error) {
      console.error('Error creating profile:', error)
    }
    
    profile = newProfile || { 
      username: user.user_metadata?.username || `user_${user.id.substring(0, 6)}`,
      avatar_url: null
    }
  }

  // Tag Filtering Logic
  let postIdsWithTag = null
  if (activeTag) {
    const { data: tagData } = await supabase.from('tags').select('id').eq('name', activeTag).single()
    if (tagData) {
      const { data: postTags } = await supabase.from('post_tags').select('post_id').eq('tag_id', tagData.id)
      postIdsWithTag = postTags ? postTags.map(pt => pt.post_id) : []
    } else {
      postIdsWithTag = [] // Tag doesn't exist, so no posts
    }
  }

  // Build base query helper
  const buildQuery = (query) => {
    if (postIdsWithTag !== null) {
      // If there are no posts with this tag, we ensure an empty result
      if (postIdsWithTag.length === 0) return query.eq('id', '00000000-0000-0000-0000-000000000000')
      query = query.in('id', postIdsWithTag)
    }
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

  // Build URL helpers preserving tab/tag state
  const tabUrl = (tab) => {
    const p = new URLSearchParams()
    p.set('tab', tab)
    if (activeTag) p.set('tag', activeTag)
    return `/feed?${p.toString()}`
  }

  return (
    <div className={styles.layout}>
      {/* Left Sidebar */}
      <Sidebar profile={profile} />

      {/* Main Feed */}
      <main className={styles.mainFeed}>
        {/* Top Header */}
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>Home</h1>
          <div className={styles.tabs}>
            <Link href={tabUrl('for-you')} className={`${styles.tab} ${activeTab === 'for-you' ? styles.activeTab : ''}`}>
              For you
            </Link>
            <Link href={tabUrl('following')} className={`${styles.tab} ${activeTab === 'following' ? styles.activeTab : ''}`}>
              Following
            </Link>
          </div>
        </header>

        {/* Composer */}
        <PostForm 
          userId={user.id} 
          username={profile.username}
          avatarUrl={profile.avatar_url}
        />

        {/* Active Tag Filter Indicator */}
        {activeTag && (
          <div className={styles.filterBar}>
            <span className={styles.filterText}>
              Showing posts for <strong>#{activeTag}</strong>
            </span>
            <Link href={`/feed?tab=${activeTab}`} className={styles.clearFilter}>
              Clear <span className="material-symbols-outlined sz-16">close</span>
            </Link>
          </div>
        )}

        {/* Posts */}
        <div className={styles.postList}>
          {posts.length > 0 ? (
            posts.map(post => <Post key={post.id} post={post} currentUserId={user.id} />)
          ) : (
            <div className={styles.emptyState}>
              <span className="material-symbols-outlined sz-48">inbox</span>
              <h3>No posts yet</h3>
              <p>
                {activeTab === 'following'
                  ? "You aren't following anyone who has posted recently."
                  : activeTag
                    ? `No posts with #${activeTag} yet. Be the first to share!`
                    : "It's quiet here. Be the first to start a conversation!"}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Right Panel */}
      <RightPanel />
    </div>
  )
}
