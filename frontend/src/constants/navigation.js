import { Dice6, Salad, UtensilsCrossed, Info, Carrot } from 'lucide-react';

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
      { name: 'Kid-Friendly Picks', url: '/?view=kids' },
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
      { name: 'Budget Meals', url: '/recipes?view=budget' },
    ],
  },
  {
    id: 'diet-plans',
    label: 'Diet Plans',
    href: '/diet-plans',
    icon: Salad,
    items: [
      { name: 'Keto Kickoff', url: '/diet-plans?plan=keto' },
      { name: 'Balanced Weekly', url: '/diet-plans?plan=balanced' },
      { name: 'High-Protein', url: '/diet-plans?plan=highProtein' },
      { name: 'Mediterranean Reset', url: '/diet-plans?plan=mediterranean' },
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
      { name: 'Careers', url: '/about-us?view=careers' },
    ],
  },
  {
    id: 'ingredients',
    label: 'Ingredients',
    href: '/ingredients',
    icon: Carrot,
    items: [
      { name: 'Seasonal Produce', url: '/ingredients?view=seasonal' },
      { name: 'Spice Cabinet', url: '/ingredients?view=spices' },
      { name: 'Pantry Staples', url: '/ingredients?view=pantry' },
      { name: 'Protein Guide', url: '/ingredients?view=protein' },
    ],
  },
];
