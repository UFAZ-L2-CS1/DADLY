import React, { useContext, useEffect, useMemo, useState } from 'react'
import DataContext from '../../context/DataContext'
import { fetchLikedRecipes } from '../../service/Data'
import UserRecipeCard from './UserRecipeCard'

const DEFAULT_SORT = {
  favourites: 'Recently saved',
  ratings: 'Your rating',
}

const SORT_OPTIONS = {
  favourites: [
    'Recently saved',
    'Alphabetical',
    'Prep time',
    'Cook time',
    'Total time',
    'Difficulty',
    'Popularity',
  ],
  ratings: ['Your rating', 'Alphabetical', 'Prep time', 'Cook time', 'Total time'],
}

const VIEW_OPTIONS = ['detailed', 'grid', 'compact']

const normalizeListType = (value = '') => {
  const input = value.toLowerCase()
  if (['watchlist', 'favourites', 'favorites', 'faves'].includes(input)) return 'favourites'
  if (['ratehistory', 'ratings', 'yourratings'].includes(input)) return 'ratings'
  return 'favourites'
}

const difficultyWeight = {
  easy: 1,
  medium: 2,
  hard: 3,
}

const sortRecipes = (data, sortType, order) => {
  if (!Array.isArray(data) || data.length === 0) return []
  const sorted = [...data]
  const direction = order === 'ascending' ? 1 : -1

  const toDate = (value) => {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? 0 : date.getTime()
  }

  switch (sortType) {
    case 'Alphabetical':
      sorted.sort((a, b) => a.name.localeCompare(b.name) * direction)
      break
    case 'Prep time':
      sorted.sort((a, b) => ((a.prep_time || 0) - (b.prep_time || 0)) * direction)
      break
    case 'Cook time':
      sorted.sort((a, b) => ((a.cook_time || 0) - (b.cook_time || 0)) * direction)
      break
    case 'Total time':
      sorted.sort(
        (a, b) =>
          ((a.prep_time || 0) + (a.cook_time || 0) - ((b.prep_time || 0) + (b.cook_time || 0))) *
          direction
      )
      break
    case 'Difficulty':
      sorted.sort(
        (a, b) =>
          ((difficultyWeight[a.difficulty] || 0) - (difficultyWeight[b.difficulty] || 0)) *
          direction
      )
      break
    case 'Popularity':
      sorted.sort((a, b) => ((a.like_count || 0) - (b.like_count || 0)) * direction)
      break
    case 'Your rating':
      sorted.sort((a, b) => ((a.rating || 0) - (b.rating || 0)) * direction)
      break
    case 'Recently saved':
    default:
      sorted.sort((a, b) => (toDate(a.liked_at || a.saved_at) - toDate(b.liked_at || b.saved_at)) * direction)
      break
  }

  return sorted
}

const UserRecipeList = ({ listType: incomingType = 'favourites' }) => {
  const listType = normalizeListType(incomingType)
  const { currentUser, loading } = useContext(DataContext)

  const [collectionState, setCollectionState] = useState({
    loading: true,
    error: null,
    items: [],
  })
  const [activeView, setActiveView] = useState('detailed')
  const [activeOrder, setActiveOrder] = useState('descending')
  const [activeSort, setActiveSort] = useState(DEFAULT_SORT[listType])
  const [selectFocused, setSelectFocused] = useState(false)

  useEffect(() => {
    setActiveSort(DEFAULT_SORT[listType])
  }, [listType])

  useEffect(() => {
    let cancelled = false

    const hydrateRatings = async (history) => {
      if (!history?.length) return []
      return history.map((entry) => ({
        id: entry.recipeId || entry.recipe_id || entry.id,
        name: entry.name,
        image_url: entry.image_url,
        prep_time: entry.prep_time || 0,
        cook_time: entry.cook_time || 0,
        difficulty: entry.difficulty || 'medium',
        like_count: entry.like_count || 0,
        rating: entry.rating,
        description: entry.description,
        saved_at: entry.rated_at || entry.saved_at,
      }))
    }

    async function loadCollection() {
      if (loading) {
        setCollectionState((prev) => ({ ...prev, loading: true, error: null }))
        return
      }

      if (!currentUser) {
        setCollectionState({
          loading: false,
          error: 'Sign in to see your personalised recipe lists.',
          items: [],
        })
        return
      }

      setCollectionState({ loading: true, error: null, items: [] })

      try {
        if (listType === 'ratings') {
          const ratings = await hydrateRatings(currentUser.rateHistory || currentUser.ratings)
          if (!cancelled) {
            setCollectionState({
              loading: false,
              error: ratings.length ? null : 'You have not rated any recipes yet.',
              items: ratings,
            })
          }
          return
        }

        const response = await fetchLikedRecipes(100)
        if (!cancelled) {
          setCollectionState({
            loading: false,
            error: null,
            items: response?.recipes || [],
          })
        }
      } catch (err) {
        console.error('Failed to load user collection', err)
        if (!cancelled) {
          setCollectionState({
            loading: false,
            error: 'We could not load this collection. Please try again in a moment.',
            items: [],
          })
        }
      }
    }

    loadCollection()
    return () => {
      cancelled = true
    }
  }, [currentUser, listType, loading])

  const sortedItems = useMemo(() => {
    return sortRecipes(collectionState.items, activeSort, activeOrder)
  }, [collectionState.items, activeSort, activeOrder])

  const toggleOrder = () => {
    setActiveOrder((prev) => (prev === 'ascending' ? 'descending' : 'ascending'))
  }

  const renderToolbar = () => (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <p className='text-sm text-[#6b6b6b]'>{sortedItems.length} recipes</p>
        <div className='flex items-center gap-3 flex-wrap'>
          <div className='flex items-center gap-2'>
            <p className='text-sm text-[#6b6b6b]'>Sort by</p>
            <div
              className={`rounded-xl border px-3 py-1.5 text-sm text-[#EB7A30] relative ${
                selectFocused ? 'border-[#EB7A30]' : 'border-transparent'
              }`}
            >
              <select
                value={activeSort}
                onChange={(event) => setActiveSort(event.target.value)}
                onFocus={() => setSelectFocused(true)}
                onBlur={() => setSelectFocused(false)}
                className='appearance-none bg-transparent pr-6 cursor-pointer focus:outline-none'
              >
                {SORT_OPTIONS[listType].map((option) => (
                  <option value={option} key={option}>
                    {option}
                  </option>
                ))}
              </select>
              <span className='absolute right-2 top-1/2 -translate-y-1/2 text-[#EB7A30]'>▾</span>
            </div>
          </div>
          <button
            onClick={toggleOrder}
            className='w-10 h-10 rounded-full border border-[#f0cdb6] flex items-center justify-center text-[#EB7A30] hover:bg-[#fff4ed]'
          >
            {activeOrder === 'ascending' ? '↑' : '↓'}
          </button>
          <div className='flex items-center rounded-full border border-[#f6decf] overflow-hidden'>
            {VIEW_OPTIONS.map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-4 py-2 text-sm transition-colors ${
                  activeView === view
                    ? 'bg-[#EB7A30] text-white'
                    : 'text-[#6b6b6b] hover:text-[#EB7A30]'
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    if (collectionState.loading) {
      return (
        <div className='space-y-5'>
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className='h-32 bg-gradient-to-r from-[#fff4ed] to-white rounded-[28px] animate-pulse'
            />
          ))}
        </div>
      )
    }

    if (collectionState.error) {
      return (
        <div className='border border-dashed border-[#EB7A30] rounded-3xl p-6 text-center space-y-3'>
          <p className='text-sm text-[#6b6b6b]'>{collectionState.error}</p>
        </div>
      )
    }

    if (!sortedItems.length) {
      return (
        <div className='border border-[#f6decf] rounded-3xl p-6 text-center space-y-3 bg-[#fffdfb]'>
          <p className='text-lg font-semibold text-[#121212]'>Nothing to show yet</p>
          <p className='text-sm text-[#6b6b6b]'>
            Start saving recipes to build this list. Every swipe right adds a new favourite.
          </p>
        </div>
      )
    }

    if (activeView === 'grid') {
      return (
        <div className='flex flex-wrap gap-5'>
          {sortedItems.map((recipe) => (
            <UserRecipeCard key={recipe.id} recipe={recipe} view='grid' listType={listType} />
          ))}
        </div>
      )
    }

    if (activeView === 'compact') {
      return (
        <div className='flex flex-col divide-y divide-[#f6decf]'>
          {sortedItems.map((recipe) => (
            <UserRecipeCard key={recipe.id} recipe={recipe} view='compact' listType={listType} />
          ))}
        </div>
      )
    }

    return (
      <div className='flex flex-col gap-5'>
        {sortedItems.map((recipe) => (
          <UserRecipeCard key={recipe.id} recipe={recipe} view='detailed' listType={listType} />
        ))}
      </div>
    )
  }

  return (
    <section className='space-y-6'>
      {renderToolbar()}
      {renderContent()}
    </section>
  )
}

export default UserRecipeList
