import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Post from '@/components/Post'
import Sidebar from '@/components/Sidebar'
import RightPanel from '@/components/RightPanel'
import styles from '@/app/feed/feed.module.css'

export const dynamic = 'force-dynamic'

export default async function PostPage({ params }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get user profile if logged in
  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data || {
      username: user.user_metadata?.username || `user_${user.id.substring(0, 6)}`,
      avatar_url: null
    }
  }

  // Fetch the specific post
  const { data: post, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles!posts_user_id_fkey ( id, username, avatar_url, display_name, first_name, last_name ),
      likes    ( user_id ),
      comments ( *, profiles ( username, avatar_url ) )
    `)
    .eq('id', id)
    .single()

  if (error || !post) {
    if (error) console.error('[Post] Fetch error:', error)
    return notFound()
  }

  // Resolve comment profiles manually (if necessary, though the join should cover it)
  // Our schema actually allows comments to join to profiles just fine.

  return (
    <div className={styles.layout}>
      {/* Left Sidebar */}
      {user && <Sidebar profile={profile} />}

      {/* Main Content */}
      <main 
        className={styles.mainFeed} 
        style={!user ? { margin: '0 auto', borderLeft: '1px solid var(--border)', maxWidth: '600px' } : {}}
      >
        {/* Top Header */}
        <header className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/feed" className={styles.backBtn} style={{ color: 'var(--on-surface)', display: 'flex' }}>
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <h1 className={styles.pageTitle}>Post</h1>
          </div>
        </header>

        {/* Post */}
        <div className={styles.postList} style={{ padding: '16px 0' }}>
          <Post post={post} currentUserId={user?.id} />
        </div>
      </main>

      {/* Right Panel */}
      {user && <RightPanel />}
    </div>
  )
}
