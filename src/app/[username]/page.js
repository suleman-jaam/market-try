import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import EditProfileModal from '@/components/EditProfileModal'
import FollowButton from '@/components/FollowButton'
import Post from '@/components/Post'
import Sidebar from '@/components/Sidebar'
import RightPanel from '@/components/RightPanel'
import ShareProfileButton from '@/components/ShareProfileButton'
import ProfileTabs from '@/components/ProfileTabs'
import feedStyles from '../feed/feed.module.css'
import styles from './profile.module.css'

export const dynamic = 'force-dynamic'

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

  // Fetch follower count & IDs
  const { data: followersData, count: followerCount } = await supabase
    .from('follows')
    .select('follower_id', { count: 'exact' })
    .eq('following_id', profile.id)

  // Fetch following count & IDs
  const { data: followingData, count: followingCount } = await supabase
    .from('follows')
    .select('following_id', { count: 'exact' })
    .eq('follower_id', profile.id)

  // Calculate mutual friends
  let friends = []
  const followerIds = (followersData || []).map(f => f.follower_id)
  const followingIds = (followingData || []).map(f => f.following_id)
  const mutualIds = followerIds.filter(id => followingIds.includes(id))

  if (mutualIds.length > 0) {
    const { data: mutualProfiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', mutualIds)
    friends = mutualProfiles || []
  }

  // Check if current user is following this profile
  let isFollowing = false
  if (currentUser && !isOwnProfile) {
    // If the current user is in the followerIds list we just fetched, they are following
    isFollowing = followerIds.includes(currentUser.id)
  }

  // Fetch user's posts
  let posts = []
  const { data: rawPosts, error: postsError } = await supabase
    .from('posts')
    .select('*, profiles!posts_user_id_fkey(*), likes(user_id), comments(*, profiles(*))')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })

  if (postsError) {
    console.error('[Profile] Posts query error:', postsError)
    // Fallback if relation fails
    const { data: fallbackPosts } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
    
    if (fallbackPosts) {
      // Fetch comments for these posts
      const postIds = fallbackPosts.map(p => p.id)
      const { data: rawComments } = await supabase
        .from('comments')
        .select('*')
        .in('post_id', postIds)
      
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

      posts = fallbackPosts.map(p => ({
        ...p,
        profiles: profile, // We already have this user's profile
        likes: [],
        comments: commentsByPost[p.id] || []
      }))
    }
  } else {
    posts = rawPosts || []
  }

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
                <div style={{ marginTop: '-16px' }}>
                  <FollowButton targetUserId={profile.id} currentUserId={currentUser?.id} initialIsFollowing={isFollowing} />
                </div>
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
        <ProfileTabs profile={profile} posts={posts} currentUser={currentUser} friends={friends} isOwnProfile={isOwnProfile} />

      </main>

      {/* Right Panel */}
      <RightPanel />
    </div>
  )
}
