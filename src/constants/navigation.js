import { Dice6, Salad, UtensilsCrossed, Info } from 'lucide-react';

export const NAV_SECTIONS = [
  {
    id: 'meal-game',
    label: 'Meal Game',
    href: '/',
    icon: Dice6,
    items: [
      { name: 'Spin & Dine', url: '/?view=spin' },
      { name: 'Under 20 Minutes', url: '/?view=quick' },
      { name: 'Challenge Mode', url: '/?view=challenge' },
    ],
  },
  {
    id: 'recipes',
    label: 'Recipes',
    href: '/recipes',
    icon: UtensilsCrossed,
    items: [
      { name: 'Trending', url: '/recipes?view=trending' },
      { name: 'By Cuisine', url: '/recipes?view=cuisines' },
      { name: 'Desserts', url: '/recipes?view=desserts' },
    ],
  },
  {
    id: 'diet-plans',
    label: 'Diet Plans',
    href: '/diet-plans',
    icon: Salad,
    items: [
      { name: 'Keto Kickoff', url: '/diet-plans?keto' },
      { name: 'Balanced Weekly', url: '/diet-plans?balanced' },
      { name: 'High-Protein', url: '/diet-plans?highProtein' },
    ],
  },
  {
    id: 'about-us',
    label: 'About Us',
    href: '/about-us',
    icon: Info,
    items: [
      { name: 'Our Story', url: '/about-us?view=story' },
      { name: 'Team', url: '/about-us?view=team' },
      { name: 'Contact', url: '/about-us?view=contact' },
    ],
  },
];
