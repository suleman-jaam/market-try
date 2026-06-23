'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Sidebar.module.css'

const NAV_ITEMS = [
  { href: '/feed', label: 'Home', icon: 'home' },
  { href: '/search', label: 'Explore', icon: 'explore' },
  { href: '/notifications', label: 'Notifications', icon: 'notifications' },
  { href: '/messages', label: 'Messages', icon: 'mail' },
  { href: '/profile', label: 'Profile', icon: 'person' },
]

export default function Sidebar({ profile, onPost }) {
  const pathname = usePathname()

  return (
    <nav className={styles.sidebar}>
      {/* Brand */}
      <div className={styles.brand}>
        <span className={styles.brandName}>GrowthPulse</span>
        <span className={styles.brandSub}>Seller Hub</span>
      </div>

      {/* Nav Links */}
      <div className={styles.navLinks}>
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const isActive = pathname === href || (href === '/feed' && pathname.startsWith('/feed'))
          return (
            <Link
              key={href}
              href={href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              <span className={`material-symbols-outlined ${isActive ? 'fill' : ''}`}>
                {icon}
              </span>
              <span className={styles.navLabel}>{label}</span>
            </Link>
          )
        })}

        {/* Post Button */}
        <button className={styles.postBtn} onClick={onPost}>
          Post
        </button>
      </div>

      {/* Bottom: Settings + User */}
      <div className={styles.bottom}>
        <Link href="/settings" className={styles.navItem}>
          <span className="material-symbols-outlined">settings</span>
          <span className={styles.navLabel}>Settings</span>
        </Link>

        {profile && (
          <Link href={`/${profile.username}`} className={styles.userChip}>
            <div className={styles.userAvatar}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.username} />
              ) : (
                <span className={styles.avatarInitial}>
                  {(profile.display_name || profile.username || '?').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userDisplayName}>
                {profile.display_name || profile.username}
              </span>
              <span className={styles.userHandle}>@{profile.username}</span>
            </div>
          </Link>
        )}
      </div>
    </nav>
  )
}
