import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import RightPanel from '@/components/RightPanel'
import styles from './notifications.module.css'

export const dynamic = 'force-dynamic'

function timeAgo(dateParam) {
  if (!dateParam) return ''
  const date = typeof dateParam === 'object' ? dateParam : new Date(dateParam)
  const today = new Date()
  const seconds = Math.round((today - date) / 1000)
  const minutes = Math.round(seconds / 60)
  const hours = Math.round(minutes / 60)
  const days = Math.round(hours / 24)

  if (seconds < 60) return 'Just now'
  else if (minutes < 60) return `${minutes}m`
  else if (hours < 24) return `${hours}h`
  else if (days < 7) return `${days}d`
  else return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get or auto-create user profile
  let { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  if (!profile) {
    const { data: newProfile } = await supabase.from('profiles').insert({
      id: user.id,
      username: user.user_metadata?.username || `user_${user.id.substring(0, 6)}`,
      email: user.email,
    }).select().single()
    profile = newProfile
  }

  // Fetch notifications
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*, actor:profiles!notifications_actor_id_fkey(username, display_name, first_name, last_name, avatar_url)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  // Mark all as read (fire and forget)
  if (notifications && notifications.some(n => !n.read)) {
    supabase.from('notifications').update({ read: true }).eq('user_id', user.id).then()
  }

  return (
    <div className={styles.layout}>
      {/* Left Sidebar */}
      <Sidebar profile={profile} />

      {/* Main Content (Centered) */}
      <main className={styles.mainColumn} style={{ borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', minHeight: '100vh' }}>
        <header className={styles.header} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '0 16px' }}>
          <h1 className={styles.title} style={{ margin: 0, padding: '16px 0' }}>Notifications</h1>
        </header>

        <div className={styles.notifList}>
          {notifications && notifications.length > 0 ? (
            notifications.map(notif => {
              const actor = notif.actor
              const displayName = (actor?.first_name && actor?.last_name) 
                ? `${actor.first_name} ${actor.last_name}` 
                : (actor?.display_name || actor?.username || 'Someone')
              
              let actionText = ''
              let icon = ''
              let link = `/@${actor?.username}`

              if (notif.type === 'follow') {
                actionText = 'followed you'
                icon = 'person_add'
              } else if (notif.type === 'like') {
                actionText = 'liked your post'
                icon = 'favorite'
              } else if (notif.type === 'comment') {
                actionText = 'commented on your post'
                icon = 'chat_bubble'
              }

              return (
                <Link key={notif.id} href={link} className={`${styles.notifRow} ${notif.read ? '' : styles.unread}`}>
                  <div className={styles.iconWrap}>
                    {actor?.avatar_url ? (
                      <img src={actor.avatar_url} alt={actor.username} className={styles.actorAvatar} />
                    ) : (
                      <div className={styles.avatarFallback}>
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className={`material-symbols-outlined sz-16 ${styles.actionIcon}`}>{icon}</span>
                  </div>
                  <div className={styles.notifBody}>
                    <p className={styles.notifText}>
                      <span className={styles.actorName}>{displayName}</span> {actionText}
                    </p>
                    <span className={styles.notifTime}>{timeAgo(notif.created_at)}</span>
                  </div>
                </Link>
              )
            })
          ) : (
            <div className={styles.emptyState}>
              <span className="material-symbols-outlined sz-48">notifications_off</span>
              <h3>No notifications yet</h3>
              <p>When someone interacts with you, you'll see it here.</p>
            </div>
          )}
        </div>
      </main>

      {/* Right Panel */}
      <RightPanel />
    </div>
  )
}
