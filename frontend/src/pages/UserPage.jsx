import React, { useContext } from 'react'
import { Link, useParams } from 'react-router-dom'
import DataContext from '../../context/DataContext'
import UserRecipeList from '../components/UserRecipeList'
import UserProfilePanel from '../components/UserProfilePanel'

const normalizeListType = (value = '') => {
  const input = value.toLowerCase()
  if (['watchlist', 'favourites', 'favorites', 'faves'].includes(input)) return 'favourites'
  if (['ratehistory', 'ratings', 'yourratings'].includes(input)) return 'ratings'
  return 'favourites'
}

const LIST_COPY = {
  favourites: {
    label: 'Your favourites',
    subtitle: 'Recipes you have saved while swiping through Dadly.',
    description:
      'Every right swipe ends up in your favourites. Sort this list to plan weekly menus, revisit seasonal dishes, or quickly find the recipes your family keeps asking for.',
  },
  ratings: {
    label: 'Your ratings',
    subtitle: 'A record of the dishes you have rated inside Dadly.',
    description:
      'Use your ratings to remember the recipes that truly impressed you—and the ones that need tweaks. Share thoughtful notes with friends or keep track of what to cook next.',
  },
}

const UserPage = () => {
  const { listType = 'favourites' } = useParams()
  const normalizedType = normalizeListType(listType)
  const { currentUser } = useContext(DataContext)

  const heroCopy = LIST_COPY[normalizedType]

  if (!currentUser) {
    return (
      <section className='min-h-[60vh] flex items-center justify-center px-5'>
        <div className='max-w-lg w-full border border-[#f6decf] rounded-3xl p-10 text-center space-y-6 bg-gradient-to-b from-[#fff4ed] to-white'>
          <p className='uppercase text-xs tracking-[0.4rem] text-[#EB7A30]'>Dadly</p>
          <h1 className='text-3xl font-semibold text-[#121212]'>Sign in to view your recipes</h1>
          <p className='text-[#5c5c5c]'>
            Save and rate recipes to build a personalised library that follows you across devices.
          </p>
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
    <section className='bg-[#fff7f2] py-24 px-5'>
      <div className='max-w-6xl mx-auto space-y-12'>
        <header className='space-y-3 text-center sm:text-left'>
          <p className='text-xs uppercase tracking-[0.4rem] text-[#EB7A30]'>{heroCopy.subtitle}</p>
          <h1 className='text-4xl sm:text-5xl font-semibold text-[#121212]'>{heroCopy.label}</h1>
          <p className='text-lg text-[#5c5c5c] max-w-3xl'>{heroCopy.description}</p>
        </header>

        <div className='grid lg:grid-cols-[2fr,1fr] gap-10'>
          <div className='space-y-8'>
            <UserRecipeList listType={normalizedType} />
          </div>
          <aside className='space-y-6'>
            <UserProfilePanel />
            <div className='bg-[#fff4ed] rounded-[32px] p-6 space-y-4'>
              <p className='text-lg font-semibold text-[#121212]'>Need a fresh idea?</p>
              <p className='text-sm text-[#5c5c5c]'>
                Jump back to the swipe deck to discover seasonal recipes or build your pantry list
                to fine-tune recommendations.
              </p>
              <Link
                to='/'
                className='inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#EB7A30] text-white text-sm font-semibold'
              >
                Explore recipes
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default UserPage
