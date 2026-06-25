'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import styles from './EditProfileModal.module.css'

export default function EditProfileModal({ profile }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [form, setForm] = useState({
    username: profile.username || '',
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    bio: profile.bio || '',
    location: profile.location || '',
    website_url: profile.website_url || '',
  })

  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar_url || '')

  const [bannerFile, setBannerFile] = useState(null)
  const [bannerPreview, setBannerPreview] = useState(profile.banner_url || '')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleBannerChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setBannerFile(file)
      setBannerPreview(URL.createObjectURL(file))
    }
  }

  const uploadImage = async (file, pathPrefix) => {
    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${pathPrefix}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${profile.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('profile_images')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      throw uploadError
    }

    const { data: { publicUrl } } = supabase.storage
      .from('profile_images')
      .getPublicUrl(filePath)

    return publicUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    let finalAvatarUrl = profile.avatar_url
    let finalBannerUrl = profile.banner_url

    try {
      if (avatarFile) {
        finalAvatarUrl = await uploadImage(avatarFile, 'avatar')
      }
      if (bannerFile) {
        finalBannerUrl = await uploadImage(bannerFile, 'banner')
      }
    } catch (uploadError) {
      setLoading(false)
      toast.error('Image upload failed. Is the "profile_images" bucket public in Supabase?')
      console.error(uploadError)
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        username: form.username,
        first_name: form.first_name,
        last_name: form.last_name,
        bio: form.bio,
        location: form.location,
        website_url: form.website_url,
        avatar_url: finalAvatarUrl,
        banner_url: finalBannerUrl
      })
      .eq('id', profile.id)

    setLoading(false)

    if (error) {
      if (error.code === '23505') {
        toast.error('Username is already taken.')
      } else {
        toast.error('Failed to update profile: ' + error.message)
      }
      return
    }

    toast.success('Profile updated!')
    setIsOpen(false)
    
    if (form.username !== profile.username) {
        router.push(`/@${form.username}`)
    } else {
        router.refresh()
    }
  }

  return (
    <>
      <button className={styles.editBtn} onClick={() => setIsOpen(true)}>
        Edit Profile
      </button>

      {isOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Edit Profile</h2>
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                <span className="material-symbols-outlined sz-20">close</span>
              </button>
            </div>

            <form id="edit-profile-form" onSubmit={handleSubmit} className={styles.form}>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Profile Picture</label>
                  <div className={styles.imageUploadWrap}>
                    {avatarPreview && <img src={avatarPreview} alt="Avatar" className={styles.avatarPreview} />}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className={styles.fileInput}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Cover Photo</label>
                  <div className={styles.imageUploadWrap}>
                    {bannerPreview && <img src={bannerPreview} alt="Banner" className={styles.bannerPreview} />}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerChange}
                      className={styles.fileInput}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>First Name</label>
                  <input
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    placeholder="First Name"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Last Name</label>
                  <input
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    placeholder="Last Name"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Username</label>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Username"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Location</label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Website URL</label>
                  <input
                    name="website_url"
                    type="url"
                    value={form.website_url}
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

            </form>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              <button
                form="edit-profile-form"
                type="submit"
                className={styles.saveBtn}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
