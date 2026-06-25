'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

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
      const { error } = await supabase
        .from('follows')
        .delete()
        .match({ follower_id: currentUserId, following_id: targetUserId })
      if (!error) toast.success('Unfollowed successfully')
      else toast.error('Failed to unfollow')
    } else {
      // Follow
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: currentUserId, following_id: targetUserId })
      if (!error) toast.success('Followed successfully')
      else toast.error('Failed to follow')
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
