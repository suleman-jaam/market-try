'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './PostForm.module.css'

export const CATEGORIES = [
  'General',
  'Amazon FBA',
  'Shopify',
  'Dropshipping',
  'Etsy',
  'TikTok Shop'
]

export default function PostForm({ userId }) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('General')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from('posts').insert({
      user_id: userId,
      content: content.trim(),
      category: category === 'General' ? null : category,
    })

    if (!error) {
      setContent('')
      setCategory('General')
      router.refresh() // Refresh the page to show the new post
    } else {
      console.error('Error creating post:', error)
      alert(`Failed to create post: ${error.message}`)
    }
    
    setLoading(false)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <textarea
        className={styles.textarea}
        placeholder="What's working in your store right now?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={500}
        disabled={loading}
      />
      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          <select 
            className={styles.categorySelect} 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            disabled={loading}
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className={styles.footerRight}>
          <span className={styles.counter}>{content.length}/500</span>
          <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '8px 24px' }} disabled={loading || !content.trim()}>
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </form>
  )
}
