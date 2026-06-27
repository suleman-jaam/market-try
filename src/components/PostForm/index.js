'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import styles from './PostForm.module.css'

const MAX_CHARS = 500

export default function PostForm({ userId, avatarUrl, username }) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }, [content])

  // Extract hashtags from content
  const detectedTags = [...new Set((content.match(/#\w+/g) || []).map(t => t.replace(/^#/, '').toLowerCase()))]
  const charsLeft = MAX_CHARS - content.length
  const isOverLimit = charsLeft < 0
  const isEmpty = !content.trim()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isEmpty || isOverLimit) return
    setLoading(true)
    const supabase = createClient()

    // 1. Create the post
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert({ user_id: userId, content: content.trim() })
      .select()
      .single()

    if (!postError && postData) {
      // 2. Process hashtags
      if (detectedTags.length > 0) {
        // Upsert tags (insert if not exists)
        await supabase
          .from('tags')
          .upsert(detectedTags.map(name => ({ name })), { onConflict: 'name', ignoreDuplicates: true })

        // Fetch tag IDs
        const { data: tagRecords } = await supabase
          .from('tags')
          .select('id, name')
          .in('name', detectedTags)

        // Link tags → post
        if (tagRecords?.length > 0) {
          await supabase.from('post_tags').insert(
            tagRecords.map(tag => ({ post_id: postData.id, tag_id: tag.id }))
          )
        }
      }

      setContent('')
      toast.success('Post created!', {
        icon: '🚀',
        style: {
          borderRadius: '12px',
          background: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
        },
      })
      router.refresh()
    } else {
      console.error('[PostForm] Failed to create post:', postError)
      toast.error('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const initial = (username || '?').charAt(0).toUpperCase()

  return (
    <div className={styles.formWrap}>
      {/* User Avatar */}
      <div className={styles.avatarCol}>
        <div className={styles.avatar}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={username} />
          ) : (
            <span>{initial}</span>
          )}
        </div>
      </div>

      {/* Form */}
      <form className={styles.form} onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          placeholder="What's happening in your shop? Use #tags to reach more sellers"
          value={content}
          onChange={e => setContent(e.target.value)}
          maxLength={MAX_CHARS + 50} /* soft limit — enforce via isOverLimit */
          disabled={loading}
          rows={2}
        />

        {/* Live hashtag preview */}
        {detectedTags.length > 0 && (
          <div className={styles.tagPreview}>
            {detectedTags.map(tag => (
              <span key={tag} className={styles.tagPill}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className={styles.footer}>
          {/* Media action buttons */}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.actionBtn}
              title="Add image (coming soon)"
              onClick={() => toast('Image upload coming soon 🚧', { icon: '🖼️' })}
            >
              <span className="material-symbols-outlined sz-20">image</span>
            </button>
            <button
              type="button"
              className={styles.actionBtn}
              title="Add poll (coming soon)"
              onClick={() => toast('Polls coming soon 🚧', { icon: '📊' })}
            >
              <span className="material-symbols-outlined sz-20">bar_chart</span>
            </button>
            <button
              type="button"
              className={styles.actionBtn}
              title="Use #hashtag to tag your post"
              onClick={() => {
                setContent(prev => prev + (prev.endsWith(' ') || prev === '' ? '#' : ' #'))
                textareaRef.current?.focus()
              }}
            >
              <span className="material-symbols-outlined sz-20">tag</span>
            </button>
          </div>

          <div className={styles.footerRight}>
            {/* Character counter */}
            {content.length > 0 && (
              <span
                className={`${styles.charCounter} ${charsLeft <= 20 ? styles.charWarn : ''} ${isOverLimit ? styles.charOver : ''}`}
              >
                {charsLeft}
              </span>
            )}

            <button
              type="submit"
              className={styles.postBtn}
              disabled={loading || isEmpty || isOverLimit}
            >
              {loading ? (
                <span className={styles.spinner} />
              ) : (
                'Post'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
