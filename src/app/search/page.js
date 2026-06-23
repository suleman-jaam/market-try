import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import Post from '@/components/Post'
import styles from './search.module.css'

export default async function SearchPage({ searchParams }) {
  const params = await searchParams
  const query = params.q || ''

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  let users = []
  let posts = []

  if (query) {
    // Search users by username
    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${query}%`)
      .limit(10)

    users = usersData || []

    // Search posts by content
    const { data: postsData } = await supabase
      .from('posts')
      .select('*, profiles(username, avatar_url), likes(user_id), comments(*, profiles(username, avatar_url))')
      .ilike('content', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20)

    posts = postsData || []
  } else {
    // Show some recent posts as "Explore" when there's no query
    const { data: explorePosts } = await supabase
      .from('posts')
      .select('*, profiles(username, avatar_url), likes(user_id), comments(*, profiles(username, avatar_url))')
      .order('created_at', { ascending: false })
      .limit(10)

    posts = explorePosts || []
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/feed" className={styles.backLink}>← Back to Feed</Link>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>Discover</h1>

        <form action="/search" method="GET" className={styles.searchForm}>
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search users or posts..."
            className={styles.searchInput}
            autoFocus
          />
          <button type="submit" className={styles.searchBtn}>Search</button>
        </form>

        {query ? (
          <>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Users</h2>
              {users.length > 0 ? (
                <div className={styles.userGrid}>
                  {users.map(u => (
                    <Link key={u.id} href={`/${u.username}`} className={styles.userCard}>
                      <div className={styles.avatar}>
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt={u.username} className={styles.avatarImg} />
                        ) : (
                          <div className={styles.avatarPlaceholder}>
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className={styles.userInfo}>
                        <div className={styles.username}>@{u.username}</div>
                        <div className={styles.bio}>{u.bio || 'E-commerce seller'}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No users found.</p>
              )}
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Posts</h2>
              {posts.length > 0 ? (
                <div className={styles.postList}>
                  {posts.map(post => (
                    <Post key={post.id} post={post} currentUserId={user.id} />
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No posts found.</p>
              )}
            </section>
          </>
        ) : (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Explore Latest Posts</h2>
            {posts.length > 0 ? (
              <div className={styles.postList}>
                {posts.map(post => (
                  <Post key={post.id} post={post} currentUserId={user.id} />
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                No posts to explore yet.
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}
