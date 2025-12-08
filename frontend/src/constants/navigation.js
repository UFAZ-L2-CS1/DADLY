import { Dice6, Salad, UtensilsCrossed, Info, Carrot } from 'lucide-react';

const ingredientLink = (ingredient) => `/recipes?ingredient=${encodeURIComponent(ingredient)}`;

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
    href: '/recipes',
    icon: Carrot,
    items: [
      {
        name: 'Vegetables',
        subItems: [
          { name: 'Spinach', url: ingredientLink('spinach') },
          { name: 'Broccoli', url: ingredientLink('broccoli') },
          { name: 'Bell Pepper', url: ingredientLink('bell pepper') },
          { name: 'Sweet Potato', url: ingredientLink('sweet potato') },
        ],
      },
      {
        name: 'Meat & Seafood',
        subItems: [
          { name: 'Chicken Breast', url: ingredientLink('chicken breast') },
          { name: 'Ground Beef', url: ingredientLink('ground beef') },
          { name: 'Salmon', url: ingredientLink('salmon') },
          { name: 'Shrimp', url: ingredientLink('shrimp') },
        ],
      },
      {
        name: 'Dairy & Eggs',
        subItems: [
          { name: 'Mozzarella', url: ingredientLink('mozzarella') },
          { name: 'Greek Yogurt', url: ingredientLink('greek yogurt') },
          { name: 'Parmesan', url: ingredientLink('parmesan') },
          { name: 'Eggs', url: ingredientLink('eggs') },
        ],
      },
      {
        name: 'Pantry Staples',
        subItems: [
          { name: 'Brown Rice', url: ingredientLink('brown rice') },
          { name: 'Quinoa', url: ingredientLink('quinoa') },
          { name: 'Chickpeas', url: ingredientLink('chickpeas') },
          { name: 'Pasta', url: ingredientLink('pasta') },
        ],
      },
      {
        name: 'Herbs & Spices',
        subItems: [
          { name: 'Basil', url: ingredientLink('basil') },
          { name: 'salt', url: ingredientLink('salt') },
          { name: 'Cilantro', url: ingredientLink('cilantro') },
          { name: 'Garlic', url: ingredientLink('garlic') },
          { name: 'Ginger', url: ingredientLink('ginger') },
        ],
      },
    ],
  },
];
