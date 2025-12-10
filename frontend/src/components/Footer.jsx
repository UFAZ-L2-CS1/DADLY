import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaYoutube, FaTwitter } from 'react-icons/fa';

const linkGroups = [
  {
    title: 'Discover',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Recipes', href: '/recipes' },
      { label: 'Diet Plans', href: '/diet-plans' },
      { label: 'About', href: '/about-us' }
    ]
  },
  {
    title: 'Support',
    links: [
      { label: 'My Pantry', href: '/pantry' },
      { label: 'Profile', href: '/user/profile' },
      { label: 'Contact', href: '/about-us#contact' },
      { label: 'FAQs', href: '/about-us#faq' }
    ]
  }
];

const socials = [
  { label: 'Instagram', icon: FaInstagram, href: 'https://instagram.com/' },
  { label: 'Facebook', icon: FaFacebookF, href: 'https://facebook.com/' },
  { label: 'YouTube', icon: FaYoutube, href: 'https://youtube.com/' },
  { label: 'Twitter', icon: FaTwitter, href: 'https://twitter.com/' }
];

const Footer = () => {
  const year = new Date().getFullYear();
  const handleNewsletterSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <footer className='bg-slate-900 text-white mt-12 border-t border-slate-800'>
      <div className='max-w-[1400px] mx-auto px-5 pt-12 pb-8 grid gap-10 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]'>
        <div>
          <Link
            to='/'
            className='text-3xl font-bold lilita-one-regular text-[#E64C15] tracking-wider hover:opacity-80 transition-opacity'
          >
            DADLY
          </Link>
          <p className='mt-4 text-sm text-slate-300 max-w-md'>
            Simple, family-first cooking inspiration curated for busy parents. Discover recipes,
            pantry planning tools, and balanced meal ideas tailored for real-life schedules.
          </p>

          <div className='mt-6 flex items-center gap-3'>
            {socials.map(({ label, icon: Icon, href }) => (
              <a
                key={label}
                href={href}
                target='_blank'
                rel='noreferrer'
                className='w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center hover:bg-[#E64C15] hover:border-[#E64C15] transition-colors'
                aria-label={label}
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {linkGroups.map(({ title, links }) => (
          <div key={title}>
            <h4 className='text-sm font-semibold uppercase tracking-[0.2em] text-slate-400'>{title}</h4>
            <ul className='mt-4 space-y-2'>
              {links.map(({ label, href }) => (
                <li key={label}>
                  {href.startsWith('http') ? (
                    <a
                      href={href}
                      className='text-slate-200 text-sm hover:text-white transition-colors'
                    >
                      {label}
                    </a>
                  ) : (
                    <Link
                      to={href}
                      className='text-slate-200 text-sm hover:text-white transition-colors'
                    >
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className='border-t border-slate-800 lg:border-0 pt-6 lg:pt-0'>
          <p className='text-sm font-semibold text-white'>Newsletter</p>
          <p className='text-slate-300 text-sm mt-2'>Join the weekly prep list for seasonal menus, shopping tips, and product updates.</p>
          <form onSubmit={handleNewsletterSubmit} className='mt-5 flex gap-3 flex-col sm:flex-row'>
            <label className='sr-only' htmlFor='footer-email'>Email</label>
            <input
              id='footer-email'
              type='email'
              placeholder='Email address'
              className='w-full rounded-xl border border-slate-700 bg-slate-800 text-white px-4 py-3 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#E64C15]'
            />
            <button
              type='submit'
              className='shrink-0 bg-[#E64C15] hover:bg-[#d43f0f] text-white text-sm font-semibold rounded-xl px-6 py-3 transition-colors'
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className='border-t border-slate-800 mt-8'>
        <div className='max-w-[1400px] mx-auto px-5 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400'>
          <p>© {year} DADLY. All rights reserved.</p>
          <div className='flex items-center gap-5'>
            <Link to='/about-us#privacy' className='hover:text-white transition-colors'>Privacy</Link>
            <Link to='/about-us#terms' className='hover:text-white transition-colors'>Terms</Link>
            <Link to='/about-us#cookies' className='hover:text-white transition-colors'>Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
