'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import styles from './PostForm.module.css'

export default function PostForm({ userId, avatarUrl, username }) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    const supabase = createClient()

    // 1. Create the post
    const { data: postData, error: postError } = await supabase.from('posts').insert({
      user_id: userId,
      content: content.trim()
    }).select().single()

    if (!postError && postData) {
      // 2. Extract unique lowercase hashtags
      const tags = [...new Set(content.match(/#\w+/g) || [])].map(t => t.toLowerCase())
      
      if (tags.length > 0) {
        // 3. Upsert tags (insert if not exists)
        // using ignoreDuplicates: true is another way, but upsert with onConflict is standard
        await supabase
          .from('tags')
          .upsert(tags.map(name => ({ name })), { onConflict: 'name', ignoreDuplicates: true })
        
        // 4. Fetch the tag IDs for the tags we just extracted
        const { data: tagRecords } = await supabase
          .from('tags')
          .select('id, name')
          .in('name', tags)

        // 5. Link tags to the post in post_tags
        if (tagRecords && tagRecords.length > 0) {
          const postTags = tagRecords.map(tag => ({
            post_id: postData.id,
            tag_id: tag.id
          }))
          await supabase.from('post_tags').insert(postTags)
        }
      }

      setContent('')
      toast.success('Post created successfully')
      router.refresh()
    } else {
      console.error('Error creating post:', postError)
      toast.error(`Failed to create post: ${postError?.message || 'Unknown error'}`)
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
          placeholder="What's happening in your shop?"
          value={content}
          onChange={e => setContent(e.target.value)}
          maxLength={500}
          disabled={loading}
          rows={3}
        />

        <div className={styles.footer}>
          {/* Media action buttons */}
          <div className={styles.actions}>
            <button type="button" className={styles.actionBtn} title="Add image" onClick={() => toast('Image upload coming soon', { icon: '🚧' })}>
              <span className="material-symbols-outlined sz-20">image</span>
            </button>
            <button type="button" className={styles.actionBtn} title="Add poll" onClick={() => toast('Polls coming soon', { icon: '🚧' })}>
              <span className="material-symbols-outlined sz-20">bar_chart</span>
            </button>
            <button type="button" className={styles.actionBtn} title="Add tag" onClick={() => toast('Product tags coming soon', { icon: '🚧' })}>
              <span className="material-symbols-outlined sz-20">local_offer</span>
            </button>
          </div>

          <button
            type="submit"
            className={styles.postBtn}
            disabled={loading || !content.trim()}
          >
            {loading ? 'Posting…' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  )
}
