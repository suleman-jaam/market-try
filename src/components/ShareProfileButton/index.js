'use client'

import { useState } from 'react'

export default function ShareProfileButton({ username, className }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/@${username}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  return (
    <button className={className} onClick={handleShare}>
      <span className="material-symbols-outlined sz-18">
        {copied ? 'check' : 'share'}
      </span>
      {copied ? 'Copied!' : 'Share'}
    </button>
  )
}
