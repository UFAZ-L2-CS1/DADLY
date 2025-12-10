import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import DataContext from '../../context/DataContext'
import UserProfilePanel from '../components/UserProfilePanel'

const UserProfile = () => {
  const { currentUser } = useContext(DataContext)

  if (!currentUser) {
    return (
      <section className='min-h-[60vh] flex items-center justify-center px-5'>
        <div className='max-w-lg w-full border border-[#f6decf] rounded-3xl p-10 text-center space-y-6 bg-gradient-to-b from-[#fff4ed] to-white'>
          <p className='uppercase text-xs tracking-[0.4rem] text-[#EB7A30]'>Dadly</p>
          <h1 className='text-3xl font-semibold text-[#121212]'>Sign in to manage your profile</h1>
          <p className='text-[#5c5c5c]'>Update dietary preferences, allergies, and more once you log in.</p>
          <Link
            to='/auth/token'
            className='inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#EB7A30] text-white font-semibold'
          >
            Sign in
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className='bg-[#fff7f2] py-16 px-4'>
      <div className='max-w-4xl mx-auto space-y-8'>
        <header className='space-y-2'>
          <p className='text-xs uppercase tracking-[0.4rem] text-[#EB7A30]'>Your profile</p>
          <h1 className='text-4xl font-semibold text-[#121212]'>Manage account</h1>
          <p className='text-sm text-[#6b6b6b]'>View account stats, update preferences, or delete your Dadly account.</p>
        </header>
        <UserProfilePanel />
      </div>
    </section>
  )
}

export default UserProfile
