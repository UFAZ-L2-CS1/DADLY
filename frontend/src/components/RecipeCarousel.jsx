import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import DataContext from '../../context/DataContext'
import {
  fetchRecipeDetails,
  fetchRecipeFeed,
  fetchLikedRecipes,
  likeRecipe,
  unlikeRecipe
} from '../../service/Data'
import { deriveDietaryTags } from '../utils/dietaryTags'
import { PiBookmarkSimple, PiBookmarkSimpleFill, PiHeartStraight, PiHeartStraightFill } from 'react-icons/pi'
import { Link, useNavigate } from 'react-router-dom'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten-free', label: 'Gluten-Free' },
  { id: 'dairy-free', label: 'Dairy-Free' },
]

const ITEMS_PER_VIEW = 4

const RecipeCarousel = () => {
  const { currentUser, loading } = useContext(DataContext)
  const [recipes, setRecipes] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [fetchState, setFetchState] = useState({ loading: true, error: null })
  const [savedIds, setSavedIds] = useState(new Set())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [busyRecipe, setBusyRecipe] = useState(null)
  const sliderRef = useRef(null)
  const navigate = useNavigate()

  const filteredRecipes = useMemo(() => {
    if (activeFilter === 'all') return recipes
    return recipes.filter((recipe) => recipe.dietaryTags?.includes(activeFilter))
  }, [recipes, activeFilter])

  const totalPages = Math.max(1, Math.ceil(filteredRecipes.length / ITEMS_PER_VIEW))
  const currentPage = Math.min(totalPages, Math.floor(currentIndex / ITEMS_PER_VIEW) + 1)

  const resetPosition = useCallback(() => {
    setCurrentIndex(0)
    if (sliderRef.current) {
      sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' })
    }
  }, [])

  const loadRecipes = useCallback(async () => {
    if (!currentUser) {
      setFetchState({ loading: false, error: 'Sign in to see personalized recipes.' })
      return
    }

    setFetchState({ loading: true, error: null })
    try {
      const [feed, likedResponse] = await Promise.all([
        fetchRecipeFeed(16),
        fetchLikedRecipes(100),
      ])

      const detailResults = await Promise.all(
        feed.map((recipe) =>
          fetchRecipeDetails(recipe.id)
            .then((fullRecipe) => ({ ...recipe, ...fullRecipe }))
            .catch(() => recipe)
        )
      )

      const withTags = detailResults.map((recipe) => ({
        ...recipe,
        dietaryTags: deriveDietaryTags(recipe),
      }))

      setRecipes(withTags)
      setSavedIds(new Set((likedResponse?.recipes || []).map((recipe) => recipe.id)))
      setFetchState({ loading: false, error: null })
      resetPosition()
    } catch (err) {
      console.error('Failed to load recipes:', err)
      setFetchState({
        loading: false,
        error: 'We could not load recipes right now. Please try again shortly.',
      })
    }
  }, [currentUser, resetPosition])

  useEffect(() => {
    if (!loading) {
      loadRecipes()
    }
  }, [loading, loadRecipes])

  useEffect(() => {
    resetPosition()
  }, [activeFilter, resetPosition])

  const handlePrev = () => {
    if (!sliderRef.current) return
    const offset = sliderRef.current.clientWidth
    sliderRef.current.scrollBy({ left: -offset, behavior: 'smooth' })
    setCurrentIndex((prev) => Math.max(0, prev - ITEMS_PER_VIEW))
  }

  const handleNext = () => {
    if (!sliderRef.current) return
    const offset = sliderRef.current.clientWidth
    sliderRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    setCurrentIndex((prev) => Math.min(filteredRecipes.length - 1, prev + ITEMS_PER_VIEW))
  }

  const toggleSaved = async (recipeId) => {
    if (!currentUser) {
      navigate('/auth/token')
      return
    }
    if (busyRecipe) return
    setBusyRecipe(recipeId)
    try {
      if (savedIds.has(recipeId)) {
        await unlikeRecipe(recipeId)
        setSavedIds((prev) => {
          const next = new Set(prev)
          next.delete(recipeId)
          return next
        })
      } else {
        await likeRecipe(recipeId)
        setSavedIds((prev) => new Set(prev).add(recipeId))
      }
    } catch (err) {
      console.error('Failed to toggle favourite:', err)
    } finally {
      setBusyRecipe(null)
    }
  }

  if (fetchState.loading) {
    return (
      <section className='py-12 space-y-4'>
        <div className='h-6 w-72 bg-gray-200 animate-pulse rounded-full' />
        <div className='h-[360px] bg-gray-100 animate-pulse rounded-3xl' />
      </section>
    )
  }

  if (fetchState.error) {
    return (
      <section className='py-12'>
        <div className='border border-dashed border-[#EB7A30] rounded-3xl p-6 text-center space-y-3'>
          <p className='text-lg font-semibold text-[#121212]'>{fetchState.error}</p>
          {currentUser ? (
            <button
              onClick={loadRecipes}
              className='px-4 py-2 rounded-full bg-[#EB7A30] text-white text-sm'
            >
              Try again
            </button>
          ) : (
            <button
              onClick={() => navigate('/auth/token')}
              className='px-4 py-2 rounded-full border border-[#EB7A30] text-[#EB7A30] text-sm'
            >
              Sign in
            </button>
          )}
        </div>
      </section>
    )
  }

  if (!filteredRecipes.length) {
    return null
  }

  return (
    <section className='py-16 space-y-10'>
      <div className='flex flex-col items-center gap-4 text-center'>
        <p className='tracking-[0.5rem] uppercase text-xs text-[#EB7A30]'>
          Recipes based on dietary preferences
        </p>
        <h2 className='text-3xl sm:text-4xl text-[#181818] tracking-[0.3rem]'>
          RECIPES BASED ON DIETARY PREFERENCES
        </h2>
        <div className='flex flex-wrap justify-center gap-3'>
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-5 py-2 rounded-full text-sm transition ${
                activeFilter === filter.id
                  ? 'bg-[#EB7A30] text-white'
                  : 'bg-[#f9f9f9] text-[#555]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className='flex items-center justify-between text-sm text-[#6b6b6b]'>
        <span>
          Showing{' '}
          <strong className='text-[#EB7A30]'>
            {filteredRecipes.length}
          </strong>{' '}
          recipes
        </span>
        <div className='flex items-center gap-4'>
          <span>
            {currentPage} / {totalPages}
          </span>
          <div className='flex gap-2'>
            <button
              onClick={handlePrev}
              className='w-9 h-9 rounded-full border border-[#e4e4e4] flex items-center justify-center hover:border-[#EB7A30]'
            >
              ‹
            </button>
            <button
              onClick={handleNext}
              className='w-9 h-9 rounded-full border border-[#e4e4e4] flex items-center justify-center hover:border-[#EB7A30]'
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <div
        ref={sliderRef}
        className='flex gap-6 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory'
      >
        {filteredRecipes.map((recipe) => {
          const isSaved = savedIds.has(recipe.id)
          const handleFavouriteClick = (event) => {
            event.preventDefault()
            event.stopPropagation()
            toggleSaved(recipe.id)
          }

          return (
            <Link
              key={recipe.id}
              to={`/recipes/${recipe.id}`}
              className='min-w-[250px] sm:min-w-[280px] lg:min-w-[300px] snap-start flex-shrink-0'
            >
              <div className='relative rounded-[32px] overflow-hidden shadow-md'>
                <img
                  src={recipe.image_url}
                  alt={recipe.name}
                  className='h-[420px] w-full object-cover transition-transform duration-300 hover:scale-105'
                  loading='lazy'
                  onError={(event) => {
                    event.currentTarget.src =
                      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'
                  }}
                />
                
                <button
                  type='button'
                  onClick={handleFavouriteClick}
                  disabled={busyRecipe === recipe.id}
                  className='absolute top-4 right-4 bg-white/90 rounded-full p-3 shadow-lg border border-white hover:bg-white transition'
                  aria-label={isSaved ? 'Remove from saved recipes' : 'Save recipe'}
                >
                  {isSaved ? (
                    <PiBookmarkSimpleFill className='text-[#EB7A30] text-xl' />
                  ) : (
                    <PiBookmarkSimple className='text-xl text-[#181818]' />
                  )}
                </button>
              </div>
              <div className='mt-4 space-y-3'>
                <h3 className='text-xl font-semibold text-[#161616]'>{recipe.name}</h3>
                <div className='flex items-center justify-between text-sm text-[#6b6b6b]'>
                  <span>
                    Prep {recipe.prep_time ?? '—'}m • Cook {recipe.cook_time ?? '—'}m
                  </span>
                  <span>❤️ {recipe.like_count ?? 0}</span>
                </div>
                <button
                  type='button'
                  onClick={handleFavouriteClick}
                  disabled={busyRecipe === recipe.id}
                  className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition ${
                    isSaved
                      ? 'bg-[#EB7A30] border-[#EB7A30] text-white'
                      : 'border-[#EB7A30] text-[#EB7A30] hover:bg-[#EB7A30]/10'
                  }`}
                >
                  {isSaved ? (
                    <>
                      <PiHeartStraightFill className='text-base' />
                      In favourites
                    </>
                  ) : (
                    <>
                      <PiHeartStraight className='text-base' />
                      Add to favourites
                    </>
                  )}
                </button>
              </div>
              
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default RecipeCarousel
