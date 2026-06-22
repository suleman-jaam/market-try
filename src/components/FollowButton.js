'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function FollowButton({ targetUserId, currentUserId, initialIsFollowing }) {
  const router = useRouter()
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [loading, setLoading] = useState(false)

  // Don't show button if looking at own profile, or not logged in
  if (!currentUserId || targetUserId === currentUserId) return null

  const handleToggle = async () => {
    setLoading(true)
    const supabase = createClient()
    
    // Optimistic UI update
    setIsFollowing(!isFollowing)

    if (isFollowing) {
      // Unfollow
      await supabase
        .from('follows')
        .delete()
        .match({ follower_id: currentUserId, following_id: targetUserId })
    } else {
      // Follow
      await supabase
        .from('follows')
        .insert({ follower_id: currentUserId, following_id: targetUserId })
    }

    setLoading(false)
    router.refresh() // Refresh to update counts on the server component
  }

  return (
    <button 
      onClick={handleToggle}
      disabled={loading}
      className={isFollowing ? "btn-secondary" : "btn-primary"}
      style={{ width: 'auto', padding: '8px 20px', fontSize: '14px', marginTop: '16px' }}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  )
}
