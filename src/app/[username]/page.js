import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import EditProfileModal from '@/components/EditProfileModal'
import Post from '@/components/Post'
import Sidebar from '@/components/Sidebar'
import RightPanel from '@/components/RightPanel'
import ShareProfileButton from '@/components/ShareProfileButton'
import ProfileTabs from '@/components/ProfileTabs'
import feedStyles from '../feed/feed.module.css'
import styles from './profile.module.css'

export default async function ProfilePage({ params }) {
  const paramsData = await params
  const rawUsername = decodeURIComponent(paramsData.username)
  const username = rawUsername.startsWith('@') ? rawUsername.slice(1) : rawUsername
  const supabase = await createClient()

  // Get current logged in user and their profile for the Sidebar
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  let currentProfile = null
  if (currentUser) {
    const { data } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single()
    currentProfile = data
  }

  // Fetch the user profile being viewed
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) {
    notFound()
  }

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

  // Fetch user's posts
  const { data: posts } = await supabase
    .from('posts')
    .select('*, profiles(username, avatar_url, display_name), likes(user_id), comments(*, profiles(username, avatar_url))')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })

  const displayJoinedDate = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const displayName = (profile.first_name && profile.last_name) 
    ? `${profile.first_name} ${profile.last_name}` 
    : profile.username
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className={feedStyles.layout}>
      {/* Left Sidebar */}
      <Sidebar profile={currentProfile} />

      {/* Main Column */}
      <main className={feedStyles.mainFeed}>
        
        {/* Top Navigation Bar / Header */}
        <header className={styles.topHeader}>
          <Link href="/feed" className={styles.backBtn}>
            <span className="material-symbols-outlined sz-20">arrow_back</span>
          </Link>
          <div className={styles.headerInfo}>
            <h2 className={styles.headerName}>{displayName}</h2>
            <span className={styles.headerPostCount}>{posts?.length || 0} posts</span>
          </div>
        </header>

        {/* Profile Banner */}
        <div className={styles.banner}>
          {profile.banner_url ? (
            <img src={profile.banner_url} alt="Banner" className={styles.bannerImg} />
          ) : (
            <div className={styles.bannerPlaceholder}>
              <span className="material-symbols-outlined sz-32">image</span>
            </div>
          )}
        </div>

        {/* Profile Details Container */}
        <div className={styles.profileDetailsWrap}>
          
          {/* Avatar & Action Row */}
          <div className={styles.actionRow}>
            <div className={styles.avatarWrap}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={username} className={styles.avatarImg} />
              ) : (
                <div className={styles.avatarFallback}>
                  <span className="material-symbols-outlined sz-24">image</span>
                </div>
              )}
            </div>
            
            <div className={styles.actionButtons}>
              <ShareProfileButton username={profile.username} className={styles.shareBtn} />
              {isOwnProfile ? (
                <div className={styles.primaryBtnWrap}>
                  <EditProfileModal profile={profile} />
                </div>
              ) : (
                <button className={styles.primaryBtn}>{isFollowing ? 'Following' : 'Follow'}</button>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className={styles.userInfo}>
            <h1 className={styles.displayName}>{displayName}</h1>
            <h2 className={styles.username}>@{profile.username}</h2>
            
            {profile.bio && (
              <p className={styles.bio}>
                {profile.bio}
              </p>
            )}

            <div className={styles.metaRow}>
              {profile.location && (
                <div className={styles.metaItem}>
                  <span className="material-symbols-outlined sz-16">location_on</span>
                  {profile.location}
                </div>
              )}
              {profile.website_url && (
                <div className={styles.metaItem}>
                  <span className="material-symbols-outlined sz-16">link</span>
                  <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className={styles.metaLink}>
                    {profile.website_url.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              <div className={styles.metaItem}>
                <span className="material-symbols-outlined sz-16">calendar_month</span>
                Joined {displayJoinedDate}
              </div>
            </div>

            <div className={styles.statsRow}>
              <div className={styles.stat}>
                <span className={styles.statNum}>{followingCount?.toLocaleString() || 0}</span>
                <span className={styles.statLabel}>Following</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNum}>{followerCount?.toLocaleString() || 0}</span>
                <span className={styles.statLabel}>Followers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs & Content */}
        <ProfileTabs profile={profile} posts={posts} currentUser={currentUser} />

      </main>

      {/* Right Panel */}
      <RightPanel />
    </div>
  )
}
