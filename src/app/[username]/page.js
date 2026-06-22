import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import FollowButton from '@/components/FollowButton'
import styles from './profile.module.css'

export default async function ProfilePage({ params }) {
  const { username } = await params
  const supabase = await createClient()

  // Fetch user profile being viewed
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) {
    notFound()
  }

  // Get current logged in user
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  const isOwnProfile = currentUser?.id === profile.id

  // Fetch follower count
  const { count: followerCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', profile.id)

  // Fetch following count
  const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', profile.id)

  // Check if current user is following this profile
  let isFollowing = false
  if (currentUser && !isOwnProfile) {
    const { data: followRel } = await supabase
      .from('follows')
      .select('*')
      .match({ follower_id: currentUser.id, following_id: profile.id })
      .single()
    
    if (followRel) isFollowing = true
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Link href="/feed" className={styles.backLink}>← Back to Feed</Link>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username} className={styles.avatarImg} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {profile.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className={styles.info}>
            <h1 className={styles.username}>@{profile.username}</h1>
            <p className={styles.bio}>{profile.bio || 'E-commerce seller.'}</p>
            
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>{followingCount || 0}</span> Following
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>{followerCount || 0}</span> Followers
              </div>
            </div>
          </div>

          {isOwnProfile ? (
            <button className="btn-secondary" style={{width: 'auto', padding: '8px 16px', fontSize: '14px', marginTop: '16px'}}>
              Edit Profile
            </button>
          ) : (
            <FollowButton 
              targetUserId={profile.id} 
              currentUserId={currentUser?.id} 
              initialIsFollowing={isFollowing} 
            />
          )}
        </div>

        <div className={styles.tabs}>
          <div className={`${styles.tab} ${styles.activeTab}`}>Posts</div>
          <div className={styles.tab}>Likes</div>
        </div>

        <div className={styles.placeholder}>
          <p>User hasn't posted anything yet.</p>
        </div>
      </main>
    </div>
  )
}
