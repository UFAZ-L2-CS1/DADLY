import React from 'react'

const About = () => {
  return (
    <section className='max-w-[900px] pt-20 mx-auto px-5 space-y-4'>
      <h1 className='text-3xl font-semibold text-[#121212]'>About Dadly</h1>
      <p className='text-[#525252] leading-relaxed'>
        Dadly was born from the idea that meal discovery should be playful, helpful, and deeply personal.
        We are a tiny team of food lovers building tools that make it easier to feed the people you care about.
      </p>
      <div className='grid gap-4 md:grid-cols-2'>
        <div className='rounded-xl border border-[#00000017] p-4 shadow-sm'>
          <p className='text-sm uppercase tracking-widest text-[#EB7A30]'>Mission</p>
          <p className='text-[#1a1a1a] mt-2'>Remove the guesswork from cooking so you get more time at the table.</p>
        </div>
        <div className='rounded-xl border border-[#00000017] p-4 shadow-sm'>
          <p className='text-sm uppercase tracking-widest text-[#EB7A30]'>Say hello</p>
          <p className='text-[#1a1a1a] mt-2'>Reach us at <a href="mailto:hello@dadly.app" className='text-[#EB7A30] underline'>hello@dadly.app</a>.</p>
        </div>
      </div>
    </section>
  )
}

export default About
