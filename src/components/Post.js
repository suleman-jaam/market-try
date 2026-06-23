'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import styles from './Post.module.css'

function timeAgo(dateString) {
  const diff = (Date.now() - new Date(dateString)) / 1000
  if (diff < 60) return `${Math.floor(diff)}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

export default function Post({ post, currentUserId }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [commentContent, setCommentContent] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [liked, setLiked] = useState(post.likes?.some(l => l.user_id === currentUserId) || false)
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0)

  const isOwner = currentUserId === post.user_id
  const comments = [...(post.comments || [])].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  )

  const username = post.profiles?.username || 'unknown'
  const displayName = post.profiles?.display_name || username
  const initial = (displayName).charAt(0).toUpperCase()

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return
    setIsDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('posts').delete().eq('id', post.id)
    if (!error) router.refresh()
    else setIsDeleting(false)
  }

  const handleLike = async () => {
    const supabase = createClient()
    if (liked) {
      setLiked(false)
      setLikeCount(c => c - 1)
      await supabase.from('likes').delete().match({ user_id: currentUserId, post_id: post.id })
    } else {
      setLiked(true)
      setLikeCount(c => c + 1)
      await supabase.from('likes').insert({ user_id: currentUserId, post_id: post.id })
    }
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
    if (!error) { setCommentContent(''); router.refresh() }
    setIsSubmittingComment(false)
  }

  const renderContent = (text) => {
    if (!text) return null
    const parts = text.split(/(#\w+)/g)
    return parts.map((part, i) => {
      if (part.startsWith('#')) {
        return (
          <Link 
            key={i} 
            href={`/feed?tag=${encodeURIComponent(part.substring(1).toLowerCase())}`} 
            style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}
          >
            {part}
          </Link>
        )
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <article className={styles.post}>
      {/* Avatar */}
      <div className={styles.avatarWrap}>
        <Link href={`/${username}`} className={styles.avatarLink}>
          {post.profiles?.avatar_url ? (
            <img src={post.profiles.avatar_url} alt={username} className={styles.avatarImg} />
          ) : (
            <div className={styles.avatarFallback}>{initial}</div>
          )}
        </Link>
      </div>

      {/* Body */}
      <div className={styles.body}>
        {/* Post Header */}
        <div className={styles.postHeader}>
          <div className={styles.authorInfo}>
            <Link href={`/${username}`} className={styles.displayName}>
              {displayName}
            </Link>
            <span className={styles.handle}>@{username}</span>
            <span className={styles.dot}>·</span>
            <span className={styles.time}>{timeAgo(post.created_at)}</span>
          </div>
          <div className={styles.postActions}>
            {isOwner && (
              <button
                onClick={handleDelete}
                className={styles.moreBtn}
                disabled={isDeleting}
                title="Delete post"
              >
                <span className="material-symbols-outlined sz-20">
                  {isDeleting ? 'hourglass_empty' : 'more_horiz'}
                </span>
              </button>
            )}
            {!isOwner && (
              <button className={styles.moreBtn} title="More options">
                <span className="material-symbols-outlined sz-20">more_horiz</span>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <p className={styles.content}>{renderContent(post.content)}</p>

        {/* Engagement Bar */}
        <div className={styles.engageBar}>
          {/* Comment */}
          <button
            className={styles.engageBtn}
            onClick={() => setShowComments(!showComments)}
          >
            <span className={`${styles.engageIcon} ${styles.commentIcon}`}>
              <span className="material-symbols-outlined sz-18">chat_bubble</span>
            </span>
            {comments.length > 0 && <span className={styles.engageCount}>{comments.length}</span>}
          </button>

          {/* Repost */}
          <button className={styles.engageBtn}>
            <span className={`${styles.engageIcon} ${styles.repostIcon}`}>
              <span className="material-symbols-outlined sz-18">repeat</span>
            </span>
          </button>

          {/* Like */}
          <button
            className={`${styles.engageBtn} ${liked ? styles.engageLiked : ''}`}
            onClick={handleLike}
          >
            <span className={`${styles.engageIcon} ${styles.likeIcon}`}>
              <span className={`material-symbols-outlined sz-18 ${liked ? 'fill' : ''}`}>favorite</span>
            </span>
            {likeCount > 0 && <span className={styles.engageCount}>{likeCount}</span>}
          </button>

          {/* Views */}
          <button className={styles.engageBtn}>
            <span className={`${styles.engageIcon} ${styles.viewIcon}`}>
              <span className="material-symbols-outlined sz-18">bar_chart</span>
            </span>
          </button>

          {/* Share */}
          <button className={styles.engageBtn}>
            <span className={`${styles.engageIcon} ${styles.shareIcon}`}>
              <span className="material-symbols-outlined sz-18">share</span>
            </span>
          </button>
        </div>

        {/* Comments */}
        {showComments && (
          <div className={styles.commentsWrap}>
            {comments.map(c => (
              <div key={c.id} className={styles.comment}>
                <div className={styles.commentAvatar}>
                  {c.profiles?.avatar_url ? (
                    <img src={c.profiles.avatar_url} alt={c.profiles.username} />
                  ) : (
                    <span>{(c.profiles?.username || '?').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className={styles.commentBody}>
                  <span className={styles.commentUser}>@{c.profiles?.username}</span>
                  <span className={styles.commentText}>{c.content}</span>
                </div>
              </div>
            ))}

            {currentUserId ? (
              <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
                <input
                  type="text"
                  placeholder="Write a comment…"
                  value={commentContent}
                  onChange={e => setCommentContent(e.target.value)}
                  className={styles.commentInput}
                  disabled={isSubmittingComment}
                />
                <button
                  type="submit"
                  className={styles.commentSubmit}
                  disabled={isSubmittingComment || !commentContent.trim()}
                >
                  Reply
                </button>
              </form>
            ) : (
              <Link href="/login" className={styles.loginPrompt}>
                Log in to join the conversation →
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
