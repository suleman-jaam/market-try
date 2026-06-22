'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import styles from './Post.module.css'

export default function Post({ post, currentUserId }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [commentContent, setCommentContent] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  const isOwner = currentUserId === post.user_id
  const hasLiked = post.likes?.some(like => like.user_id === currentUserId)
  const likeCount = post.likes?.length || 0
  
  // Sort comments oldest first
  const comments = [...(post.comments || [])].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  )

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return
    setIsDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('posts').delete().eq('id', post.id)
    if (!error) router.refresh()
    else setIsDeleting(false)
  }

  const handleLikeToggle = async () => {
    const supabase = createClient()
    if (hasLiked) {
      // Unlike
      await supabase.from('likes').delete().match({ user_id: currentUserId, post_id: post.id })
    } else {
      // Like
      await supabase.from('likes').insert({ user_id: currentUserId, post_id: post.id })
    }
    router.refresh()
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!commentContent.trim()) return

    setIsSubmittingComment(true)
    const supabase = createClient()
    const { error } = await supabase.from('comments').insert({
      user_id: currentUserId,
      post_id: post.id,
      content: commentContent.trim()
    })

    if (!error) {
      setCommentContent('')
      router.refresh()
    }
    setIsSubmittingComment(false)
  }

  // Format date simply
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <article className={styles.post}>
      <div className={styles.avatar}>
        {post.profiles?.avatar_url ? (
          <img src={post.profiles.avatar_url} alt={post.profiles.username} className={styles.avatarImg} />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {post.profiles?.username?.charAt(0).toUpperCase() || '?'}
          </div>
        )}
      </div>
      
      <div className={styles.content}>
        <div className={styles.header}>
          <Link href={`/${post.profiles?.username}`} className={styles.username}>
            @{post.profiles?.username}
          </Link>
          <span className={styles.dot}>·</span>
          <span className={styles.date}>{formatDate(post.created_at)}</span>
          
          {post.category && (
            <>
              <span className={styles.dot}>·</span>
              <span className={styles.categoryBadge}>{post.category}</span>
            </>
          )}

          {isOwner && (
            <button 
              onClick={handleDelete} 
              className={styles.deleteBtn}
              disabled={isDeleting}
              title="Delete post"
            >
              {isDeleting ? '...' : '×'}
            </button>
          )}
        </div>
        
        <p className={styles.text}>{post.content}</p>

        {/* Engagement Actions */}
        <div className={styles.actions}>
          <button 
            onClick={handleLikeToggle} 
            className={`${styles.actionBtn} ${hasLiked ? styles.liked : ''}`}
          >
            {hasLiked ? '❤️' : '🤍'} <span className={styles.actionCount}>{likeCount > 0 ? likeCount : ''}</span>
          </button>
          
          <button 
            onClick={() => setShowComments(!showComments)} 
            className={styles.actionBtn}
          >
            💬 <span className={styles.actionCount}>{comments.length > 0 ? comments.length : ''}</span>
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className={styles.commentsSection}>
            {comments.length > 0 && (
              <div className={styles.commentList}>
                {comments.map(comment => (
                  <div key={comment.id} className={styles.comment}>
                    <span className={styles.commentUsername}>@{comment.profiles?.username}</span>
                    <span className={styles.commentText}>{comment.content}</span>
                  </div>
                ))}
              </div>
            )}
            
            <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                className={styles.commentInput}
                disabled={isSubmittingComment}
              />
              <button 
                type="submit" 
                className={styles.commentSubmit}
                disabled={isSubmittingComment || !commentContent.trim()}
              >
                Post
              </button>
            </form>
          </div>
        )}
      </div>
    </article>
  )
}
