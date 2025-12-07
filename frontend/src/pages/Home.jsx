import React from 'react'
import Header from '../components/Header'
import RecipeCarousel from '../components/RecipeCarousel'

const Home = () => {
  return (
    <div className='max-w-[1400px] mx-auto px-5 space-y-10'>
      <Header />
      <RecipeCarousel />
    </div>
  )
}

export default Home
