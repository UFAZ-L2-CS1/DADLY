import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchRecipeFeed } from '../../service/Data'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80'

const formatDifficulty = (difficulty) => {
  if (!difficulty) return 'N/A'
  const formatted = difficulty.replace(/_/g, ' ')
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

const RecipeFeedCard = ({ recipe }) => {
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0)
  const difficulty = formatDifficulty(recipe.difficulty)
  const likeCount = recipe.like_count ?? 0
  const description = recipe.description?.trim()
  const cardImage = recipe.image_url || FALLBACK_IMAGE

  return (
    <Link
      to={`/recipes/${recipe.id}`}
      className='group rounded-[32px] border border-[#f5f5f5] bg-white shadow-[0px_18px_40px_rgba(17,17,17,0.08)] overflow-hidden flex flex-col transition hover:-translate-y-1 hover:shadow-[0px_25px_60px_rgba(17,17,17,0.15)]'
    >
      <div className='h-56 w-full overflow-hidden'>
        <img
          src={cardImage}
          alt={recipe.name}
          className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
          loading='lazy'
          onError={(event) => {
            event.currentTarget.src = FALLBACK_IMAGE
          }}
        />
      </div>
      <div className='flex flex-col gap-3 p-5 flex-1'>
        <p className='text-[0.65rem] uppercase tracking-[0.4rem] text-[#EB7A30]'>
          Chef&apos;s feed
        </p>
        <h3 className='text-xl font-semibold text-[#151515] leading-tight line-clamp-2'>
          {recipe.name}
        </h3>
        {description && (
          <p className='text-sm text-[#5c5c5c] leading-relaxed line-clamp-3'>{description}</p>
        )}
        <div className='mt-auto flex items-center justify-between text-xs text-[#7a7a7a]'>
          <span>Prep {recipe.prep_time ?? '—'}m</span>
          <span>Cook {recipe.cook_time ?? '—'}m</span>
          <span>Total {totalTime || '—'}m</span>
        </div>
        <div className='flex items-center justify-between pt-3 border-t border-[#f2f2f2] text-sm text-[#EB7A30] font-semibold'>
          <span>{difficulty}</span>
          <span>❤️ {likeCount}</span>
        </div>
      </div>
    </Link>
  )
}

const RecipeFeed = ({ limit = 12 }) => {
  const [state, setState] = useState({
    loading: true,
    error: null,
    recipes: [],
  })
  const [reloadKey, setReloadKey] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadFeed() {
      setState({ loading: true, error: null, recipes: [] })
      try {
        const response = await fetchRecipeFeed(limit)
        if (cancelled) return
        const items = Array.isArray(response) ? response : []
        setState({
          loading: false,
          error: items.length ? null : 'No recipes available right now. Please check back soon.',
          recipes: items,
        })
        setHasMore(items.length === limit)
      } catch (err) {
        console.error('Failed to load recipe feed:', err)
        if (cancelled) return
        setState({
          loading: false,
          error: 'We could not load the feed right now. Please try again shortly.',
          recipes: [],
        })
        setHasMore(false)
      }
    }

    loadFeed()
    return () => {
      cancelled = true
    }
  }, [limit, reloadKey])

  const handleShowMore = async () => {
    if (loadingMore) return
    setLoadingMore(true)
    try {
      const excludeIds = state.recipes.map((recipe) => recipe.id).filter(Boolean)
      const response = await fetchRecipeFeed(limit, excludeIds)
      const nextItems = Array.isArray(response) ? response : []
      setState((prev) => {
        const existingIds = new Set(prev.recipes.map((recipe) => recipe.id))
        const merged = nextItems.filter((recipe) => !existingIds.has(recipe.id))
        return {
          ...prev,
          recipes: [...prev.recipes, ...merged],
        }
      })
      setHasMore(nextItems.length === limit)
    } catch (err) {
      console.error('Failed to fetch more recipes:', err)
      setHasMore(false)
    } finally {
      setLoadingMore(false)
    }
  }

  const renderSkeleton = () => (
    <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
      {Array.from({ length: Math.min(limit, 6) }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className='rounded-[32px] border border-[#f3f3f3] bg-white overflow-hidden animate-pulse'
        >
          <div className='h-56 bg-gray-100' />
          <div className='p-5 space-y-4'>
            <div className='h-4 w-32 bg-gray-100 rounded-full' />
            <div className='h-6 w-3/4 bg-gray-100 rounded-full' />
            <div className='space-y-2'>
              <div className='h-3 bg-gray-100 rounded-full' />
              <div className='h-3 bg-gray-100 rounded-full' />
              <div className='h-3 bg-gray-100 rounded-full w-2/3' />
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderError = () => (
    <div className='rounded-[32px] border border-dashed border-[#EB7A30] p-8 text-center space-y-4'>
      <p className='text-lg font-semibold text-[#181818]'>{state.error}</p>
      <button
        type='button'
        onClick={() => setReloadKey((prev) => prev + 1)}
        className='inline-flex items-center justify-center px-5 py-2 rounded-full bg-[#EB7A30] text-white text-sm font-semibold'
      >
        Try again
      </button>
    </div>
  )

  return (
    <section className='py-16 space-y-8'>
      <div className='text-center space-y-3'>
        <p className='text-xs uppercase tracking-[0.5rem] text-[#EB7A30]'>Daily feed</p>
        <h2 className='text-3xl sm:text-4xl font-semibold text-[#111]'>
          Discover what&apos;s cooking today
        </h2>
        <p className='text-sm text-[#6b6b6b]'>
          We pull a rotating selection of breakfast, lunch, and dinner ideas to keep you inspired.
        </p>
      </div>

      {state.loading && renderSkeleton()}
      {!state.loading && state.error && renderError()}
      {!state.loading && !state.error && state.recipes.length > 0 && (
        <>
          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {state.recipes.map((recipe) => (
              <RecipeFeedCard key ={recipe.id} recipe={recipe} />
            ))}
          </div>
          {hasMore && (
            <div className='text-center pt-4'>
              <button
                type='button'
                onClick={handleShowMore}
                disabled={loadingMore}
                className={`px-6 py-3 rounded-full border border-[#EB7A30] text-[#EB7A30] text-sm font-semibold inline-flex items-center justify-center gap-2 transition ${
                  loadingMore ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#EB7A30]/10'
                }`}
              >
                {loadingMore ? 'Loading...' : 'Show more recipes'}
              </button>
            </div>
          )}
        </>
      )}

      {!state.loading && !state.error && !state.recipes.length && (
        <p className='text-center text-sm text-[#6b6b6b]'>
          No recipes available. Please check back later.
        </p>
      )}
    </section>
  )
}

export default RecipeFeed
