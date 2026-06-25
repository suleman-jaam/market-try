'use client'

import { useState } from 'react'
import Post from '@/components/Post'
import styles from '@/app/[username]/profile.module.css'

export default function ProfileTabs({ profile, posts, currentUser }) {
  const [activeTab, setActiveTab] = useState('Posts')

  const tabs = ['Posts', 'Media', 'Insights', 'Saved']

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
