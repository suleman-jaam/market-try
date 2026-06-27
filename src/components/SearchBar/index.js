'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchBar({ initialQuery, initialFilter, initialStartDate, initialEndDate }) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery || '')
  const [filter, setFilter] = useState(initialFilter || 'all')
  const [showDatePicker, setShowDatePicker] = useState(initialFilter === 'date')
  const [startDate, setStartDate] = useState(initialStartDate || '')
  const [endDate, setEndDate] = useState(initialEndDate || '')

  useEffect(() => {
    if (filter === 'date') {
      setShowDatePicker(true)
    } else {
      setShowDatePicker(false)
    }
  }, [filter])

  const buildUrl = ({ q = query, f = filter, sd = startDate, ed = endDate } = {}) => {
    const p = new URLSearchParams()
    if (q) p.set('q', q)
    if (f && f !== 'all') p.set('filter', f)
    if (sd) p.set('startDate', sd)
    if (ed) p.set('endDate', ed)
    return `/search?${p.toString()}`
  }

  const handleSearch = (e) => {
    e.preventDefault()
    router.push(buildUrl())
  }

  const handleFilterClick = (f) => {
    const newFilter = filter === f ? 'all' : f
    setFilter(newFilter)
    if (f !== 'date') {
      const p = new URLSearchParams()
      if (query) p.set('q', query)
      if (newFilter && newFilter !== 'all') p.set('filter', newFilter)
      router.push(`/search?${p.toString()}`)
    }
  }

  const filters = [
    { key: 'friends', label: 'Friends Only', icon: 'group' },
    { key: 'verified', label: 'Verified', icon: 'verified' },
    { key: 'date', label: 'Date Range', icon: 'calendar_month' },
    { key: 'tags', label: '#Tags', icon: 'tag' },
  ]

  return (
    <div>
      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        style={{ position: 'relative', marginBottom: '16px' }}
      >
        <span
          className="material-symbols-outlined sz-20"
          style={{
            position: 'absolute', left: '16px', top: '50%',
            transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none'
          }}
        >
          search
        </span>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search posts, users, #tags..."
          style={{
            width: '100%', background: 'var(--bg-card)',
            border: '1.5px solid var(--border)', borderRadius: '12px',
            padding: '13px 16px 13px 46px', fontSize: '15px',
            fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)',
            outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s ease'
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 4px var(--primary-glow)' }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
        />
      </form>

      {/* Filter Chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Filter:</span>
        {filters.map(({ key, label, icon }) => {
          const isActive = filter === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleFilterClick(key)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '6px 14px',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderRadius: '999px', fontSize: '13px', fontWeight: 500,
                border: `1px solid ${isActive ? 'transparent' : 'var(--border)'}`,
                cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit',
                transition: 'all 0.18s ease'
              }}
            >
              <span className="material-symbols-outlined sz-16">{icon}</span>
              {label}
            </button>
          )
        })}
      </div>

      {/* Date Range Picker — only shows when Date filter is active */}
      {showDatePicker && (
        <div
          style={{
            display: 'flex', gap: '8px', alignItems: 'center',
            padding: '12px 16px', marginTop: '10px',
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: '12px', animation: 'fadeSlideIn 0.2s ease'
          }}
        >
          <span className="material-symbols-outlined sz-18" style={{ color: 'var(--primary)', flexShrink: 0 }}>
            calendar_today
          </span>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            style={{
              flex: 1, minWidth: 0, padding: '6px 10px', fontSize: '14px',
              background: 'var(--bg-card)', border: '1.5px solid var(--border)',
              borderRadius: '8px', color: 'var(--text-primary)',
              fontFamily: 'inherit', outline: 'none'
            }}
          />
          <span style={{ color: 'var(--text-muted)', fontWeight: 600, flexShrink: 0 }}>→</span>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            style={{
              flex: 1, minWidth: 0, padding: '6px 10px', fontSize: '14px',
              background: 'var(--bg-card)', border: '1.5px solid var(--border)',
              borderRadius: '8px', color: 'var(--text-primary)',
              fontFamily: 'inherit', outline: 'none'
            }}
          />
          <button
            type="button"
            onClick={() => router.push(buildUrl())}
            className="btn-primary"
            style={{ padding: '6px 16px', whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            Apply
          </button>
          {(startDate || endDate) && (
            <button
              type="button"
              onClick={() => {
                setStartDate('')
                setEndDate('')
                router.push(buildUrl({ sd: '', ed: '' }))
              }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', display: 'flex', flexShrink: 0, padding: '4px'
              }}
              title="Clear dates"
            >
              <span className="material-symbols-outlined sz-18">close</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
