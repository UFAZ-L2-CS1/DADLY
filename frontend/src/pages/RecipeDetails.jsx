import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchRecipeDetails } from '../../service/Data'
import { deriveDietaryTags } from '../utils/dietaryTags'
import { IoChevronBack } from "react-icons/io5";
const initialState = {
  loading: true,
  error: null,
  recipe: null,
}

const RecipeDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [state, setState] = useState(initialState)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    const loadRecipe = async () => {
      setState({ loading: true, error: null, recipe: null })
      try {
        const recipe = await fetchRecipeDetails(id)
        if (!active) return
        setState({ loading: false, error: null, recipe })
      } catch (err) {
        console.error('Failed to fetch recipe details:', err)
        if (!active) return
        setState({
          loading: false,
          error: 'We could not load this recipe. Please try again later.',
          recipe: null,
        })
      }
    }

    if (id) {
      loadRecipe()
    }

    return () => {
      active = false
    }
  }, [id, reloadKey])

  const recipe = state.recipe

  const dietaryTags = useMemo(() => {
    if (!recipe) return []
    return deriveDietaryTags(recipe).filter((tag) => tag !== 'all')
  }, [recipe])

  const ingredients = useMemo(() => {
    if (!recipe) return []
    if (Array.isArray(recipe.ingredients)) {
      return recipe.ingredients
    }
    if (typeof recipe.ingredients === 'string') {
      return recipe.ingredients
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean)
    }
    return []
  }, [recipe])

  const instructionSteps = useMemo(() => {
    if (!recipe?.instructions) return []
    return recipe.instructions
      .split(/\r?\n/)
      .map((step) => step.trim())
      .filter(Boolean)
  }, [recipe])

  if (state.loading) {
    return (
      <section className='max-w-5xl mx-auto px-5 py-10 space-y-6 animate-pulse'>
        <div className='h-10 w-40 bg-gray-200 rounded-full' />
        <div className='h-8 w-3/4 bg-gray-200 rounded-full' />
        <div className='h-[340px] bg-gray-100 rounded-3xl' />
        <div className='grid md:grid-cols-2 gap-6'>
          <div className='h-48 bg-gray-100 rounded-2xl' />
          <div className='h-48 bg-gray-100 rounded-2xl' />
        </div>
      </section>
    )
  }

  if (state.error) {
    return (
      <section className='max-w-2xl mx-auto px-5 py-16 text-center space-y-4'>
        <p className='text-xl font-semibold text-[#121212]'>{state.error}</p>
        <div className='flex items-center justify-center gap-3'>
          <button
            onClick={() => navigate(-1)}
            className='px-5 py-2 rounded-full border border-[#EB7A30] text-[#EB7A30]'
          >
            Go back
          </button>
          <button
            onClick={() => setReloadKey((prev) => prev + 1)}
            className='px-5 py-2 rounded-full bg-[#EB7A30] text-white'
          >
            Retry
          </button>
        </div>
      </section>
    )
  }

  if (!recipe) {
    return null
  }

  const heroImage =
    recipe.image_url ||
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80'

  return (
    <section className='max-w-5xl mx-auto px-5 py-10 space-y-10'>
      <button
        onClick={() => navigate(-1)}
        className='inline-flex items-center gap-2 text-sm text-[#EB7A30] hover:text-[#c24714]'
      >
        <IoChevronBack />Back
      </button>

      <div className='space-y-4'>
        <p className='text-xs uppercase tracking-[0.4rem] text-[#EB7A30]'>Recipe detail</p>
        <h1 className='text-3xl sm:text-4xl font-semibold text-[#111]'>{recipe.name}</h1>
        {recipe.description && (
          <p className='text-lg text-[#5c5c5c] leading-relaxed'>{recipe.description}</p>
        )}
        {dietaryTags.length > 0 && (
          <div className='flex flex-wrap gap-2'>
            {dietaryTags.map((tag) => (
              <span
                key={tag}
                className='px-3 py-1 rounded-full bg-[#fff4ed] text-[#EB7A30] text-sm font-medium'
              >
                {tag.replace('-', ' ')}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className='overflow-hidden rounded-[36px]'>
        <img
          src={heroImage}
          alt={recipe.name}
          className='w-full h-[360px] sm:h-[440px] object-cover'
          loading='lazy'
        />
      </div>

      <div className='grid sm:grid-cols-3 gap-6 bg-[#fff4ed] rounded-3xl p-6 text-center text-sm'>
        <div>
          <p className='uppercase tracking-[0.3rem] text-[#c24714]'>Prep</p>
          <p className='text-2xl font-semibold text-[#1b1b1b]'>{recipe.prep_time} min</p>
        </div>
        <div>
          <p className='uppercase tracking-[0.3rem] text-[#c24714]'>Cook</p>
          <p className='text-2xl font-semibold text-[#1b1b1b]'>{recipe.cook_time} min</p>
        </div>
        <div>
          <p className='uppercase tracking-[0.3rem] text-[#c24714]'>Difficulty</p>
          <p className='text-2xl font-semibold text-[#1b1b1b]'>{recipe.difficulty}</p>
        </div>
      </div>

      <div className='grid lg:grid-cols-2 gap-10'>
        <div className='space-y-5'>
          <h2 className='text-2xl font-semibold text-[#121212]'>Ingredients</h2>
          <ul className='space-y-3'>
            {ingredients.map((item, index) => (
              <li key={`${item}-${index}`} className='flex items-start gap-3 text-[#4a4a4a]'>
                <span className='w-2 h-2 rounded-full bg-[#EB7A30] mt-2' />
                <span>{item}</span>
              </li>
            ))}
            {!ingredients.length && <li className='text-[#888]'>Ingredients list coming soon.</li>}
          </ul>
        </div>

        <div className='space-y-5'>
          <h2 className='text-2xl font-semibold text-[#121212]'>Instructions</h2>
          <ol className='space-y-4'>
            {instructionSteps.map((step, index) => (
              <li key={`${index}-${step}`} className='flex gap-4'>
                
                <p className='text-[#4a4a4a]'>{step}</p>
              </li>
            ))}
            {!instructionSteps.length && (
              <li className='text-[#888]'>Detailed instructions will be added soon.</li>
            )}
          </ol>
        </div>
      </div>
    </section>
  )
}

export default RecipeDetails
