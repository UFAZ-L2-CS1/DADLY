import React from 'react';
import { Link } from 'react-router-dom';
import logoDadly from '../assets/logoDadly.png';

const panelContent = {
  register: {
    eyebrow: 'Plan • Cook • Thrive',
    heading: 'Join the DADLY kitchen',
    subtext: 'Curate your pantry, balance your diet, and keep favorite dishes a tap away.',
    cards: [
      {
        label: 'Pantry Pulse',
        title: 'Smart ingredient tracker',
        description: 'Keep essentials stocked and discover what you can cook right now.'
      },
      {
        label: 'Chef inspo',
        title: 'Seasonal recipe drops',
        description: 'Daily rotating menus guided by nutritionists and home chefs.'
      },
      {
        label: 'Flavor mood',
        title: 'Personalized meal ideas',
        description: 'Match cravings with your dietary goals in seconds.'
      },
      {
        label: 'Wellness',
        title: 'Balanced macros',
        description: 'Visualize macros without sacrificing the joy of cooking.'
      }
    ]
  },
  signin: {
    eyebrow: 'Welcome back',
    heading: 'Slide back into flavor mode',
    subtext: 'Pick up where you left off—your saved recipes, pantry notes, and weekly plans are all here.',
    cards: [
      {
        label: 'Pantry sync',
        title: 'Live shopping cues',
        description: 'Color coded alerts keep staples topped up for midweek cravings.'
      },
      {
        label: 'Chef inspo',
        title: 'Community favorites',
        description: 'See what the community is cooking and remix it your way.'
      },
      {
        label: 'Moodboard',
        title: 'Match cravings',
        description: 'Spicy, cozy, light—filter and taste in a glance.'
      },
      {
        label: 'Wellness',
        title: 'Macro streaks',
        description: 'Celebrate your consistency with streaks and little confetti pops.'
      }
    ]
  }
};



const AuthShowcase = ({ variant = 'signin' }) => {
  const content = panelContent[variant] ?? panelContent.signin;

  return (
    <div className="relative bg-gradient-to-br from-[#fff4ec] via-[#ffeef6] to-[#fcebdc] text-[#4f2d1e] p-8 sm:p-10 flex flex-col gap-8 overflow-hidden">
      <div className="absolute inset-0 opacity-90 pointer-events-none">
        <div className="absolute -top-24 right-0 w-72 h-72 bg-white/70 blur-[150px]" />
        <div className="absolute -bottom-28 left-0 w-80 h-80 bg-[#ffe1c9]/70 blur-[140px]" />
      </div>

      <div className="relative z-10 space-y-6">
        <Link to="/" className="inline-flex">
          <img
            src={logoDadly}
            alt="DADLY logo"
            className="w-[220px] sm:w-[260px] drop-shadow-[0_12px_32px_rgba(163,96,54,0.25)]"
          />
        </Link>
        <div className="space-y-3">
          <p className="uppercase text-xs tracking-[0.45em] text-[#c07c4a]">{content.eyebrow}</p>
          <h1 className="text-3xl sm:text-4xl font-semibold leading-tight text-[#3e1c0f]">{content.heading}</h1>
          <p className="text-base text-[#5f3420] max-w-md">{content.subtext}</p>
        </div>
      </div>

      <div className="relative z-10 grid gap-4 sm:grid-cols-2 mt-auto">
        {content.cards.map((card) => (
          <div
            key={card.title}
            className="rounded-3xl border border-white/60 bg-white/80 backdrop-blur-[2px] p-4 shadow-[0_14px_35px_rgba(122,72,45,0.08)]"
          >
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-[#d99674]">{card.label}</p>
            <p className="mt-2 text-lg font-semibold text-[#3f2619]">{card.title}</p>
            <p className="mt-1 text-sm text-[#5a3726] leading-relaxed">{card.description}</p>
          </div>
        ))}
      </div>

    
    </div>
  );
};

export default AuthShowcase;
