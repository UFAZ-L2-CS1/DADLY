import React from 'react'
import { Link } from 'react-router-dom'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80'

const formatDifficulty = (difficulty) => {
  if (!difficulty) return 'N/A'
  const formatted = difficulty.replace(/_/g, ' ')
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

const formatTimestamp = (timestamp) => {
  if (!timestamp) return null
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const RecipeStat = ({ label, value }) => (
  <div className='text-xs uppercase tracking-[0.3rem] text-[#c24714] flex flex-col gap-1'>
    <span>{label}</span>
    <span className='text-lg text-[#161616] font-semibold tracking-normal'>{value}</span>
  </div>
)

const UserRecipeCard = ({ recipe, view, listType }) => {
  const recipeLink = `/recipes/${recipe.id}`
  const ratingValue = recipe.rating ?? null
  const likedDate = formatTimestamp(recipe.liked_at || recipe.saved_at)
  const difficulty = formatDifficulty(recipe.difficulty)

  if (view === 'grid') {
    return (
      <Link
        to={recipeLink}
        className='w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33%-1rem)] rounded-3xl overflow-hidden bg-white shadow-sm border border-[#f0f0f0]'
      >
        <div className='h-52 w-full overflow-hidden'>
          <img
            src={recipe.image_url || FALLBACK_IMAGE}
            alt={recipe.name}
            className='w-full h-full object-cover transition-transform duration-300 hover:scale-105'
            loading='lazy'
            onError={(event) => {
              event.currentTarget.src = FALLBACK_IMAGE
            }}
          />
        </div>
        <div className='p-4 space-y-2'>
          <h3 className='text-lg font-semibold text-[#181818] line-clamp-2'>{recipe.name}</h3>
          <p className='text-sm text-[#6b6b6b]'>
            Prep {recipe.prep_time}m • Cook {recipe.cook_time}m
          </p>
          <div className='flex items-center gap-3 text-xs text-[#EB7A30] font-semibold'>
            <span>{difficulty}</span>
            <span>❤️ {recipe.like_count}</span>
            {ratingValue && listType === 'ratings' && (
              <span className='flex items-center gap-1'>★ {ratingValue}</span>
            )}
          </div>
        </div>
      </Link>
    )
  }

  if (view === 'compact') {
    return (
      <Link
        to={recipeLink}
        className='flex items-center justify-between gap-4 px-3 py-2 hover:bg-[#fff4ed] rounded-2xl transition-colors'
      >
        <div className='flex items-center gap-3 flex-1'>
          <img
            src={recipe.image_url || FALLBACK_IMAGE}
            alt={recipe.name}
            className='w-16 h-16 rounded-2xl object-cover'
            loading='lazy'
            onError={(event) => {
              event.currentTarget.src = FALLBACK_IMAGE
            }}
          />
          <div className='space-y-1'>
            <p className='text-sm font-semibold text-[#1a1a1a] line-clamp-1'>{recipe.name}</p>
            <p className='text-xs text-[#6b6b6b]'>
              {difficulty} • {recipe.prep_time + recipe.cook_time} mins total
            </p>
          </div>
        </div>
        <div className='text-right text-xs text-[#6b6b6b] min-w-[120px]'>
          {ratingValue && listType === 'ratings' ? (
            <span className='inline-flex items-center gap-1 text-[#EB7A30] font-semibold'>
              ★ {ratingValue}
            </span>
          ) : likedDate ? (
            <span>{likedDate}</span>
          ) : (
            <span>❤️ {recipe.like_count}</span>
          )}
        </div>
      </Link>
    )
  }

  return (
    <article className='flex flex-col md:flex-row gap-5 bg-white border border-[#f6decf] rounded-[28px] p-5 shadow-[0px_20px_60px_rgba(235,122,48,0.08)]'>
      <Link
        to={recipeLink}
        className='w-full md:w-48 h-48 rounded-3xl overflow-hidden flex-shrink-0'
      >
        <img
          src={recipe.image_url || FALLBACK_IMAGE}
          alt={recipe.name}
          className='w-full h-full object-cover'
          loading='lazy'
          onError={(event) => {
            event.currentTarget.src = FALLBACK_IMAGE
          }}
        />
      </Link>
      <div className='flex-1 space-y-4'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
          <div className='space-y-2'>
            <Link
              to={recipeLink}
              className='text-2xl font-semibold text-[#121212] hover:text-[#EB7A30] transition-colors'
            >
              {recipe.name}
            </Link>
            <p className='text-sm text-[#6b6b6b]'>
              Prep {recipe.prep_time}m • Cook {recipe.cook_time}m
            </p>
          </div>
          <div className='text-sm text-right text-[#6b6b6b] space-y-1'>
            {ratingValue && listType === 'ratings' && (
              <p className='text-base text-[#EB7A30] font-semibold'>★ {ratingValue}</p>
            )}
            {likedDate && <p>Saved {likedDate}</p>}
          </div>
        </div>
        {recipe.description && (
          <p className='text-sm text-[#4a4a4a] leading-relaxed line-clamp-3'>{recipe.description}</p>
        )}
        <div className='flex flex-wrap gap-3'>
          <RecipeStat label='Difficulty' value={difficulty} />
          <RecipeStat label='Likes' value={recipe.like_count ?? 0} />
          <RecipeStat label='Total time' value={`${recipe.prep_time + recipe.cook_time}m`} />
        </div>
      </div>
    </article>
  )
}

export default UserRecipeCard
