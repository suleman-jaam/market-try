'use client'

import { useState } from 'react'
import Post from '@/components/Post'
import styles from '@/app/[username]/profile.module.css'

import Link from 'next/link'

export default function ProfileTabs({ profile, posts, currentUser, friends = [], isOwnProfile = false }) {
  const [activeTab, setActiveTab] = useState('Posts')

  const allTabs = ['Posts', 'Friends', 'Media', 'Insights', 'Saved']
  // Friends tab is only visible to the profile owner
  const tabs = allTabs.filter(t => t !== 'Friends' || isOwnProfile)

  return (
    <>
      <div className={styles.tabs}>
        {tabs.map(tab => (
          <div 
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'Posts' && (
          <div className={styles.postList}>
            {posts && posts.length > 0 ? (
              posts.map(post => <Post key={post.id} post={post} currentUserId={currentUser?.id} />)
            ) : (
              <div className={styles.emptyState}>
                <p>@{profile.username} hasn't posted anything yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Friends' && (
          <div className={styles.usersSection}>
            {friends.length > 0 ? (
              <div className={styles.userGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', padding: '16px 0' }}>
                {friends.map(u => {
                  const displayName = (u.first_name && u.last_name) ? `${u.first_name} ${u.last_name}` : (u.display_name || u.username)
                  return (
                    <Link key={u.id} href={`/@${u.username}`} className={styles.userCard} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', textDecoration: 'none' }}>
                      <div className={styles.avatar} style={{ width: '48px', height: '48px', flexShrink: 0, borderRadius: '50%', overflow: 'hidden', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt={u.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-muted)' }}>{displayName.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className={styles.userInfo} style={{ flex: 1, minWidth: 0 }}>
                        <div className={styles.username} style={{ fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {displayName}
                        </div>
                        <div className={styles.handle} style={{ fontSize: '13px', color: 'var(--text-muted)' }}>@{u.username}</div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>@{profile.username} doesn't have any mutual friends yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Media' && (
          <div className={styles.mediaGrid}>
            {profile.avatar_url || profile.banner_url ? (
              <>
                {profile.avatar_url && (
                  <div className={styles.mediaItem}>
                    <img src={profile.avatar_url} alt="Avatar" className={styles.mediaImg} />
                  </div>
                )}
                {profile.banner_url && (
                  <div className={styles.mediaItem}>
                    <img src={profile.banner_url} alt="Banner" className={styles.mediaImg} />
                  </div>
                )}
              </>
            ) : (
              <div className={styles.emptyState} style={{ gridColumn: '1 / -1' }}>
                <p>@{profile.username} hasn't uploaded any media.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Insights' && (
          <div className={styles.emptyState}>
            <p>Insights will be available soon.</p>
          </div>
        )}

        {activeTab === 'Saved' && (
          <div className={styles.emptyState}>
            <p>Saved will be available soon.</p>
          </div>
        )}
      </div>
    </>
  )
}
