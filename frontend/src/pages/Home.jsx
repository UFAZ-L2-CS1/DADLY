import React from 'react'
import Header from '../components/Header'
import RecipeCarousel from '../components/RecipeCarousel'
import RecipeFeed from '../components/RecipeFeed'
import RecipesPage from '../components/RecipesPage'

const Home = () => {
  return (
    <div className='max-w-[1400px] mx-auto px-5 space-y-10'>
      <Header />
      <RecipeCarousel />
      <RecipeFeed />
      <RecipesPage/>
    </div>
  )
}

export default Home
