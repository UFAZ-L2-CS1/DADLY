import React from 'react'

const DietPlans = () => {
  return (
    <section className='max-w-[900px] mx-auto px-5 space-y-4'>
      <h1 className='text-3xl font-semibold text-[#121212]'>Diet Plans</h1>
      <p className='text-[#525252] leading-relaxed'>
        Structured programs that pair grocery lists with smart scheduling are almost ready.
        We are finalizing a balance between nutrition, taste, and budget friendly ingredients.
      </p>
      <ul className='list-disc pl-6 space-y-2 text-[#3a3a3a]'>
        <li>Weekly check-ins that adapt your plan based on progress.</li>
        <li>Built-in swaps for allergies or pantry changes.</li>
        <li>Shareable plans so the whole family can stay aligned.</li>
      </ul>
    </section>
  )
}

export default DietPlans
