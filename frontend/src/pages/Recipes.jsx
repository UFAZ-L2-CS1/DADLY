import React from 'react'

const Recipes = () => {
  return (
    <section className='max-w-[900px] mx-auto px-5 space-y-4'>
      <h1 className='text-3xl font-semibold text-[#121212]'>Recipes</h1>
      <p className='text-[#525252] leading-relaxed'>
        Curated collections of seasonal dishes, smart filters, and quick wins are on the way.
        Tell us what kind of recipes you would love to see next!
      </p>
      <div className='rounded-2xl border border-dashed border-[#EB7A30] p-6 space-y-2'>
        <p className='text-sm uppercase tracking-widest text-[#EB7A30]'>Coming soon</p>
        <p className='text-lg text-[#121212]'>A personalized feed of ideas tailored to your pantry and dietary goals.</p>
      </div>
    </section>
  )
}

export default Recipes
