import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DataContext from '../../context/DataContext'
import { deleteUserAccount, fetchUserStats, updateUserProfile } from '../../service/AuthService'
import { FaCalendarAlt, FaHeart, FaUtensils, FaClipboardList } from 'react-icons/fa'

const formatDate = (value) => {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown'
  return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
}

const dietaryOptions = [
  { label: 'No preference', value: 'none' },
  { label: 'Vegetarian', value: 'vegetarian' },
  { label: 'Vegan', value: 'vegan' },
  { label: 'Gluten free', value: 'gluten_free' },
  { label: 'Keto', value: 'keto' },
  { label: 'Pescatarian', value: 'pescatarian' },
]

const UserProfilePanel = () => {
  const navigate = useNavigate()
  const { currentUser, setCurrentUser } = useContext(DataContext)
  const [stats, setStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [formState, setFormState] = useState({ name: '', dietary_type: 'none', allergies: '' })
  const [formMessage, setFormMessage] = useState({ type: null, text: '' })
  const [saving, setSaving] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!currentUser) return
    setFormState({
      name: currentUser.name || '',
      dietary_type: currentUser.dietary_type || 'none',
      allergies: currentUser.allergies || '',
    })
  }, [currentUser])

  useEffect(() => {
    let cancelled = false
    if (!currentUser) {
      setStats(null)
      setLoadingStats(false)
      return
    }

    const loadStats = async () => {
      setLoadingStats(true)
      try {
        const data = await fetchUserStats()
        if (!cancelled) {
          setStats(data)
        }
      } catch (err) {
        console.error('Failed to load user stats:', err)
        if (!cancelled) {
          setStats(null)
        }
      } finally {
        if (!cancelled) {
          setLoadingStats(false)
        }
      }
    }

    loadStats()
    return () => {
      cancelled = true
    }
  }, [currentUser])

  const statsList = useMemo(() => {
    if (!currentUser) return []
    return [
      {
        label: 'Member since',
        value: formatDate(stats?.account_created_at || currentUser.created_at),
        icon: <FaCalendarAlt className='text-white text-lg' />,
        accent: 'from-[#f89a5c] to-[#f75b3f]',
      },
      {
        label: 'Days active',
        value: stats?.days_active ?? '—',
        icon: <FaClipboardList className='text-white text-lg' />,
        accent: 'from-[#fcd77d] to-[#f7a348]',
      },
      {
        label: 'Recipes liked',
        value: stats?.total_recipes_liked ?? '—',
        icon: <FaHeart className='text-white text-lg' />,
        accent: 'from-[#f57297] to-[#f34262]',
      },
      {
        label: 'Pantry items',
        value: stats?.total_pantry_items ?? '—',
        icon: <FaUtensils className='text-white text-lg' />,
        accent: 'from-[#88d4c3] to-[#4fbfa3]',
      },
    ]
  }, [currentUser, stats])

  if (!currentUser) {
    return (
      <div className='bg-white rounded-[32px] border border-[#f4d9c9] p-6 text-center'>
        <p className='text-lg font-semibold text-[#1a1a1a] mb-2'>Sign in to personalise Dadly</p>
        <p className='text-sm text-[#6b6b6b]'>Create an account to save preferences and track your pantry and recipes.</p>
      </div>
    )
  }

  const handleFieldChange = (event) => {
    const { name, value } = event.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileSubmit = async (event) => {
    event.preventDefault()
    setFormMessage({ type: null, text: '' })

    const payload = {}
    const trimmedName = formState.name.trim()
    if (trimmedName && trimmedName !== currentUser.name) {
      payload.name = trimmedName
    }
    if (formState.dietary_type !== (currentUser.dietary_type || 'none')) {
      payload.dietary_type = formState.dietary_type
    }
    if ((formState.allergies || '') !== (currentUser.allergies || '')) {
      payload.allergies = formState.allergies?.trim() || null
    }

    if (Object.keys(payload).length === 0) {
      setFormMessage({ type: 'info', text: 'No changes to save.' })
      return
    }

    setSaving(true)
    try {
      const updated = await updateUserProfile(payload)
      setCurrentUser((prev) => ({ ...prev, ...updated }))
      setFormMessage({ type: 'success', text: 'Profile updated successfully.' })
    } catch (err) {
      const detail = err?.response?.data?.detail || 'We could not update your profile.'
      setFormMessage({ type: 'error', text: detail })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async (event) => {
    event.preventDefault()
    setFormMessage({ type: null, text: '' })
    const trimmed = deletePassword.trim()
    if (!trimmed) {
      setFormMessage({ type: 'error', text: 'Enter your password to delete the account.' })
      return
    }

    if (!window.confirm('This will permanently delete your Dadly account. Continue?')) {
      return
    }

    setDeleting(true)
    try {
      await deleteUserAccount(trimmed)
      localStorage.clear()
      setCurrentUser(null)
      navigate('/')
    } catch (err) {
      const detail = err?.response?.data?.detail || 'Account deletion failed. Check your password.'
      setFormMessage({ type: 'error', text: detail })
    } finally {
      setDeleting(false)
    }
  }

  const profileInitials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((segment) => segment[0])
        .slice(0, 2)
        .join('')
    : 'U'

  return (
    <div className='space-y-8'>
      <section className='relative overflow-hidden rounded-[36px] bg-gradient-to-r from-[#fff1e8] via-[#ffe8d4] to-[#ffd6d5] border border-[#f8d2bd] p-6 shadow-[0px_25px_80px_rgba(235,122,48,0.15)]'>
        <div className='absolute -right-10 -bottom-10 w-64 h-64 bg-white/20 rounded-full blur-3xl' />
        <div className='flex flex-col md:flex-row md:items-center gap-6 relative z-10'>
          <div className='flex items-center gap-4'>
            <div className='w-20 h-20 rounded-[22px] bg-white/80 border border-white flex items-center justify-center text-3xl font-semibold text-[#EB7A30] shadow-[0_18px_30px_rgba(235,122,48,0.3)]'>
              {profileInitials}
            </div>
            <div>
              <p className='text-xs uppercase tracking-[0.4rem] text-[#EB7A30] mb-1'>Profile</p>
              <h2 className='text-2xl font-semibold text-[#1a1a1a]'>{currentUser.name}</h2>
              <p className='text-sm text-[#5c5c5c]'>{currentUser.email}</p>
            </div>
          </div>
          <div className='flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3'>
            {statsList.map((stat) => (
              <div
                key={stat.label}
                className='rounded-2xl bg-white/70 backdrop-blur-sm border border-white px-4 py-3 flex flex-col gap-1 shadow-[0_10px_30px_rgba(0,0,0,0.06)]'
              >
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-r ${stat.accent} flex items-center justify-center`}>
                  {stat.icon}
                </div>
                <p className='text-[0.65rem] uppercase tracking-[0.3rem] text-[#b55226]'>{stat.label}</p>
                <p className='text-xl font-semibold text-[#151515]'>
                  {loadingStats && stat.value === '—' ? '…' : stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className='bg-white border border-[#f4d9c9] rounded-[36px] p-6 md:p-8 space-y-6 shadow-[0px_20px_80px_rgba(235,122,48,0.09)]'>
        <div>
          <p className='text-xs uppercase tracking-[0.4rem] text-[#EB7A30]'>Preferences</p>
          <h3 className='text-xl font-semibold text-[#1c1c1c]'>Update profile</h3>
          <p className='text-sm text-[#6b6b6b]'>Adjust your display name, dietary preference, and allergy notes.</p>
        </div>
        <form className='space-y-5' onSubmit={handleProfileSubmit}>
          <div className='grid md:grid-cols-2 gap-5'>
            <div className='space-y-1.5'>
              <label htmlFor='profile-name' className='text-sm font-medium text-[#1a1a1a]'>Display name</label>
              <input
                id='profile-name'
                name='name'
                type='text'
                value={formState.name}
                onChange={handleFieldChange}
                className='w-full rounded-2xl border border-[#f2e4da] px-4 py-3 text-sm focus:outline-none focus:border-[#EB7A30] bg-[#fffaf7]'
              />
            </div>
            <div className='space-y-1.5'>
              <label htmlFor='profile-diet' className='text-sm font-medium text-[#1a1a1a]'>Dietary preference</label>
              <select
                id='profile-diet'
                name='dietary_type'
                value={formState.dietary_type}
                onChange={handleFieldChange}
                className='w-full rounded-2xl border border-[#f2e4da] px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#EB7A30]'
              >
                {dietaryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className='space-y-1.5'>
            <label htmlFor='profile-allergies' className='text-sm font-medium text-[#1a1a1a]'>Allergies</label>
            <textarea
              id='profile-allergies'
              name='allergies'
              value={formState.allergies}
              onChange={handleFieldChange}
              rows={3}
              className='w-full rounded-2xl border border-[#f2e4da] px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#EB7A30] bg-[#fffaf7]'
              placeholder='Optional'
            />
          </div>
          {formMessage.text && (
            <div
              className={`rounded-2xl px-4 py-3 text-sm ${
                formMessage.type === 'error'
                  ? 'bg-red-50 text-red-700'
                  : formMessage.type === 'success'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-orange-50 text-[#c45d1d]'
              }`}
            >
              {formMessage.text}
            </div>
          )}
          <div className='flex flex-col sm:flex-row gap-3'>
            <button
              type='submit'
              disabled={saving}
              className='inline-flex items-center justify-center rounded-full bg-[#EB7A30] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60 shadow-[0_12px_30px_rgba(235,122,48,0.35)]'
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <button
              type='button'
              onClick={() => setFormState({
                name: currentUser.name || '',
                dietary_type: currentUser.dietary_type || 'none',
                allergies: currentUser.allergies || '',
              })}
              className='inline-flex items-center justify-center rounded-full border border-[#f2e4da] px-6 py-3 text-sm font-medium text-[#5c5c5c] hover:bg-[#fff4ed]'
            >
              Reset
            </button>
          </div>
        </form>
      </section>

      <section className='bg-gradient-to-r from-[#fff0f0] to-[#ffe1e1] border border-[#ffd6d6] rounded-[36px] p-6 md:p-8 space-y-4 shadow-[0_15px_60px_rgba(231,65,65,0.2)]'>
        <div className='flex flex-col gap-1'>
          <p className='text-xs uppercase tracking-[0.4rem] text-[#c62828]'>Danger zone</p>
          <h3 className='text-lg font-semibold text-[#7a1515]'>Delete account</h3>
          <p className='text-sm text-[#a33]'>This permanently removes your Dadly account, pantry items, and recipe interactions.</p>
        </div>
        <form className='space-y-4' onSubmit={handleDeleteAccount}>
          <div className='space-y-1.5'>
            <label htmlFor='delete-password' className='text-sm font-medium text-[#851919]'>Confirm password</label>
            <input
              id='delete-password'
              type='password'
              value={deletePassword}
              onChange={(event) => setDeletePassword(event.target.value)}
              className='w-full rounded-2xl border border-[#f3b6b6] px-4 py-3 text-sm focus:outline-none focus:border-[#c62828] bg-white'
              placeholder='Enter password to confirm'
            />
          </div>
          <button
            type='submit'
            disabled={deleting}
            className='inline-flex items-center justify-center rounded-full bg-[#c62828] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60 shadow-[0_12px_30px_rgba(198,40,40,0.35)]'
          >
            {deleting ? 'Deleting...' : 'Delete account'}
          </button>
        </form>
      </section>
    </div>
  )
}

export default UserProfilePanel
