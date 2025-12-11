const MEAT_KEYWORDS = [
  'chicken',
  'beef',
  'pork',
  'lamb',
  'bacon',
  'ham',
  'turkey',
  'fish',
  'shrimp',
  'anchovy',
  'salmon',
  'tuna',
];

const DAIRY_KEYWORDS = [
  'cheese',
  'milk',
  'butter',
  'cream',
  'yogurt',
  'ghee',
  'mozzarella',
  'parmesan',
];

const EGG_HONEY_KEYWORDS = ['egg', 'yolk', 'honey', 'mayonnaise'];

const GLUTEN_KEYWORDS = ['wheat', 'flour', 'bread', 'pasta', 'soy sauce', 'barley'];

const splitTextList = (text = '') =>
  text
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

const normalizeIngredients = (ingredients) => {
  if (!ingredients) return [];
  if (Array.isArray(ingredients)) return ingredients;
  if (typeof ingredients === 'string') {
    const trimmed = ingredients.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (err) {
        // If parsing fails, fall back to newline/comma splitting
      }
    }
    return splitTextList(trimmed);
  }
  return [];
};

const normalizeList = (items = []) =>
  items
    .filter(Boolean)
    .map((item) => item.toString().toLowerCase());

export function deriveDietaryTags(recipe) {
  const sources = [
    recipe?.name,
    recipe?.description,
    ...normalizeIngredients(recipe?.ingredients),
  ];
  const text = normalizeList(sources).join(' ');

  const tags = new Set(['all']);

  const containsAny = (keywords) => keywords.some((keyword) => text.includes(keyword));

  const isVegetarian = text.length > 0 && !containsAny(MEAT_KEYWORDS);
  if (isVegetarian) {
    tags.add('vegetarian');
  }

  if (isVegetarian && !containsAny([...DAIRY_KEYWORDS, ...EGG_HONEY_KEYWORDS])) {
    tags.add('vegan');
  }

  if (!containsAny(GLUTEN_KEYWORDS)) {
    tags.add('gluten-free');
  }

  if (!containsAny(DAIRY_KEYWORDS)) {
    tags.add('dairy-free');
  }

  return Array.from(tags);
}
