import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import PostForm from '@/components/PostForm'
import Post from '@/components/Post'
import Sidebar from '@/components/Sidebar'
import RightPanel from '@/components/RightPanel'
import styles from './feed.module.css'

// Always fetch fresh data — never serve a cached page
export const dynamic = 'force-dynamic'

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
    const { data: newProfile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        username: user.user_metadata?.username || `user_${user.id.substring(0, 6)}`,
        email: user.email,
      })
      .select()
      .single()

    if (profileError) console.error('[Feed] Error creating profile:', profileError)

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
      postIdsWithTag = []
    }
  }

  // ── Fetch posts ──────────────────────────────────────────────────────────
  let posts = []
  let skipQuery = false

  try {
    let baseQuery = supabase
      .from('posts')
      .select(`
        *,
        profiles!posts_user_id_fkey ( id, username, avatar_url, display_name, first_name, last_name ),
        likes    ( user_id ),
        comments ( *, profiles ( username, avatar_url ) )
      `)

    // Tab filter
    if (activeTab === 'following') {
      const { data: follows } = await supabase
        .from('follows').select('following_id').eq('follower_id', user.id)
      const followingIds = (follows || []).map(f => f.following_id)
      if (followingIds.length === 0) {
        skipQuery = true
      } else {
        baseQuery = baseQuery.in('user_id', followingIds)
      }
    }

    // Tag filter
    if (postIdsWithTag !== null) {
      if (postIdsWithTag.length === 0) {
        // No posts with this tag — short-circuit
        skipQuery = true
      } else {
        baseQuery = baseQuery.in('id', postIdsWithTag)
      }
    }

    if (!skipQuery) {
      const { data, error } = await baseQuery.order('created_at', { ascending: false })

      if (error) {
        // Log server-side — never expose to the user
        console.error('[Feed] Query error:', error)

        // Fallback: fetch posts without the join, then manually resolve profiles
        const { data: rawPosts, error: rawError } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })

        if (rawError) {
          console.error('[Feed] Fallback query error:', rawError)
        } else if (rawPosts?.length) {
          // Fetch all unique profile IDs in one request
          const profileIds = [...new Set(rawPosts.map(p => p.user_id))]
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('*')   // select all — avoids column-not-found on older schema
            .in('id', profileIds)

          if (profilesError) {
            console.error('[Feed] Profiles fallback error:', profilesError)
          }
          const profileMap = Object.fromEntries((profilesData || []).map(p => [p.id, p]))

          // Fetch comments
          const postIds = rawPosts.map(p => p.id)
          const { data: rawComments } = await supabase
            .from('comments')
            .select('*')
            .in('post_id', postIds)
          
          // Map comments to posts and add profile data to comments if possible
          const commentsByPost = {}
          if (rawComments) {
            const commentProfileIds = [...new Set(rawComments.map(c => c.user_id))]
            const { data: commentProfiles } = await supabase.from('profiles').select('*').in('id', commentProfileIds)
            const commentProfileMap = Object.fromEntries((commentProfiles || []).map(p => [p.id, p]))
            
            rawComments.forEach(comment => {
              if (!commentsByPost[comment.post_id]) commentsByPost[comment.post_id] = []
              commentsByPost[comment.post_id].push({
                ...comment,
                profiles: commentProfileMap[comment.user_id] || null
              })
            })
          }

          posts = rawPosts.map(post => ({
            ...post,
            profiles: profileMap[post.user_id] || null,
            likes: [],
            comments: commentsByPost[post.id] || [],
          }))
        }
      } else {
        posts = data || []
      }
    }
  } catch (err) {
    console.error('[Feed] Unexpected error:', err)
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
              Showing posts for <strong>#{activeTag.replace(/^#/, '')}</strong>
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
