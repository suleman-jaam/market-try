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
      const { error } = await supabase
        .from('follows')
        .delete()
        .match({ follower_id: currentUserId, following_id: targetUserId })
      if (error) {
        console.error('[FollowButton] Unfollow failed:', error)
        setIsFollowing(true) // revert
        toast.error('Could not unfollow. Please try again.')
      }
    } else {
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: currentUserId, following_id: targetUserId })
      if (error) {
        console.error('[FollowButton] Follow failed:', error)
        setIsFollowing(false) // revert
        toast.error('Could not follow. Please try again.')
      }
    }

    setLoading(false)
    router.refresh()
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
