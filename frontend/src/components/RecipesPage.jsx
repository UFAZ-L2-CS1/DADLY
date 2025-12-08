import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaFilter, FaTimes } from 'react-icons/fa';
import { fetchRecipeFeed} from '../../service/Data';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80';

const formatDifficulty = (difficulty) => {
  if (!difficulty) return 'N/A';
  const formatted = difficulty.replace(/_/g, ' ');
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const RecipeFeedCard = ({ recipe }) => {
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
  const difficulty = formatDifficulty(recipe.difficulty);
  const likeCount = recipe.like_count ?? 0;
  const description = recipe.description?.trim();
  const cardImage = recipe.image_url || FALLBACK_IMAGE;

  return (
    <Link
      to={`/recipes/${recipe.id}`}
      className='group rounded-[32px] border border-[#f5f5f5] bg-white shadow-[0px_18px_40px_rgba(17,17,17,0.08)] overflow-hidden flex flex-col transition hover:-translate-y-1 hover:shadow-[0px_25px_60px_rgba(17,17,17,0.15)]'
    >
      <div className='h-56 w-full overflow-hidden'>
        <img
          src={cardImage}
          alt={recipe.name}
          className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
          loading='lazy'
          onError={(event) => {
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
      </div>
      <div className='flex flex-col gap-3 p-5 flex-1'>
        <p className='text-[0.65rem] uppercase tracking-[0.4rem] text-[#EB7A30]'>
          Chef&apos;s feed
        </p>
        <h3 className='text-xl font-semibold text-[#151515] leading-tight line-clamp-2'>
          {recipe.name}
        </h3>
        {description && (
          <p className='text-sm text-[#5c5c5c] leading-relaxed line-clamp-3'>{description}</p>
        )}
        <div className='mt-auto flex items-center justify-between text-xs text-[#7a7a7a]'>
          <span>Prep {recipe.prep_time ?? '—'}m</span>
          <span>Cook {recipe.cook_time ?? '—'}m</span>
          <span>Total {totalTime || '—'}m</span>
        </div>
        <div className='flex items-center justify-between pt-3 border-t border-[#f2f2f2] text-sm text-[#EB7A30] font-semibold'>
          <span>{difficulty}</span>
          <span>❤️ {likeCount}</span>
        </div>
      </div>
    </Link>
  );
};

const normalizeIngredients = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    return raw
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const formatLabel = (value = '') =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : '';

const RecipesPage = ({ limit = 12 }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedIngredient = searchParams.get('ingredient') || '';

  const [allRecipes, setAllRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedPrepTime, setSelectedPrepTime] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadRecipes = async () => {
      setLoading(true);
      setError(null);

      try {
        const feed = await fetchRecipeFeed(limit);
        if (!cancelled) {
          setAllRecipes(Array.isArray(feed) ? feed : []);
        }
      } catch (err) {
        console.error('Failed to load recipes:', err);
        if (!cancelled) {
          setError('Failed to load recipes. Please try again.');
          setAllRecipes([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadRecipes();
    return () => {
      cancelled = true;
    };
  }, [limit]);

  const updateIngredientFilter = (value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set('ingredient', value);
    } else {
      nextParams.delete('ingredient');
    }
    setSearchParams(nextParams);

  };

  const availableIngredients = useMemo(() => {
    const set = new Set();
    allRecipes.forEach((recipe) => {
      normalizeIngredients(recipe?.ingredients).forEach((item) => {
        if (item) set.add(item.toLowerCase());
      });
    });
    return Array.from(set).sort();
  }, [allRecipes]);

  const filteredRecipes = useMemo(() => {
    return allRecipes.filter((recipe) => {
      if (searchQuery && !recipe.name?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      if (selectedIngredient) {
        const hasIngredient = normalizeIngredients(recipe?.ingredients).some((item) =>
          item.toLowerCase().includes(selectedIngredient.toLowerCase())
        );
        if (!hasIngredient) return false;
      }

      if (selectedDifficulty) {
        const difficulty = recipe.difficulty?.toLowerCase();
        if (difficulty !== selectedDifficulty.toLowerCase()) return false;
      }

      if (selectedPrepTime) {
        const prepTime = Number(recipe.prep_time) || 0;
        if (selectedPrepTime === 'quick' && prepTime > 30) return false;
        if (selectedPrepTime === 'medium' && (prepTime <= 30 || prepTime > 60)) return false;
        if (selectedPrepTime === 'long' && prepTime <= 60) return false;
      }

      return true;
    });
  }, [allRecipes, searchQuery, selectedIngredient, selectedDifficulty, selectedPrepTime]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedDifficulty('');
    setSelectedPrepTime('');
    updateIngredientFilter('');
  };

  const activeFilters = [
    selectedIngredient,
    selectedDifficulty,
    selectedPrepTime,
    searchQuery,
  ].filter(Boolean).length;
console.log('Rendering RecipesPage', { loading, error, allRecipes, filteredRecipes }
    
);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-[#E64C15] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading delicious recipes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-lg text-red-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#E64C15] text-white rounded-lg hover:bg-[#d43f0f] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-[1400px] mx-auto px-5 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3 text-sm">
            <Link to="/" className="text-gray-500 hover:text-[#E64C15] transition-colors">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700 font-medium">Recipes</span>
            {selectedIngredient && (
              <>
                <span className="text-gray-400">/</span>
                <span className="text-[#E64C15] font-medium">{formatLabel(selectedIngredient)}</span>
              </>
            )}
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3 lilita-one-regular">
            {selectedIngredient ? `Recipes with ${formatLabel(selectedIngredient)}` : 'All Recipes'}
          </h1>
          <p className="text-lg text-gray-600">
            {filteredRecipes.length} delicious {filteredRecipes.length === 1 ? 'recipe' : 'recipes'} found
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-[#E64C15] text-white rounded-lg hover:bg-[#d43f0f]"
            >
              <FaFilter size={16} />
              <span>Filters</span>
              {activeFilters > 0 && (
                <span className="text-xs font-bold bg-white text-[#E64C15] px-2 py-0.5 rounded-full">
                  {activeFilters}
                </span>
              )}
            </button>

            {activeFilters > 0 && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-gray-600 hover:text-[#E64C15]"
              >
                Clear all
              </button>
            )}
          </div>

          <div className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-4`}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search Recipes</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by recipe name..."
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg outline-none focus:border-[#E64C15]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={(event) => setSelectedDifficulty(event.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-white outline-none focus:border-[#E64C15]"
                >
                  <option value="">All Levels</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Prep Time</label>
                <select
                  value={selectedPrepTime}
                  onChange={(event) => setSelectedPrepTime(event.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-white outline-none focus:border-[#E64C15]"
                >
                  <option value="">Any Duration</option>
                  <option value="quick">Quick (≤30 min)</option>
                  <option value="medium">Medium (30-60 min)</option>
                  <option value="long">Long (60+ min)</option>
                </select>
              </div>
            </div>

            {activeFilters > 0 && (
              <div className="hidden lg:flex justify-end">
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-[#E64C15] hover:bg-orange-50 rounded-lg"
                >
                  <FaTimes size={14} />
                  <span>Clear all filters</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {activeFilters > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {searchQuery && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E64C15] text-white rounded-full text-sm">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:opacity-80">
                  <FaTimes size={12} />
                </button>
              </span>
            )}
            {selectedIngredient && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E64C15] text-white rounded-full text-sm">
                {formatLabel(selectedIngredient)}
                <button onClick={() => updateIngredientFilter('')} className="hover:opacity-80">
                  <FaTimes size={12} />
                </button>
              </span>
            )}
            {selectedDifficulty && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E64C15] text-white rounded-full text-sm">
                {formatLabel(selectedDifficulty)}
                <button onClick={() => setSelectedDifficulty('')} className="hover:opacity-80">
                  <FaTimes size={12} />
                </button>
              </span>
            )}
            {selectedPrepTime && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E64C15] text-white rounded-full text-sm">
                {selectedPrepTime === 'quick' && 'Quick (≤30 min)'}
                {selectedPrepTime === 'medium' && 'Medium (30-60 min)'}
                {selectedPrepTime === 'long' && 'Long (60+ min)'}
                <button onClick={() => setSelectedPrepTime('')} className="hover:opacity-80">
                  <FaTimes size={12} />
                </button>
              </span>
            )}
          </div>
        )}

        {filteredRecipes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <div className="text-6xl mb-6">🍳</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No recipes found</h2>
            <p className="text-gray-600 mb-6">Try adjusting your filters to see more results</p>
            <button
              onClick={handleClearFilters}
              className="px-8 py-3 bg-[#E64C15] text-white rounded-lg hover:bg-[#d43f0f] transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredRecipes.map((recipe) => (
              <RecipeFeedCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipesPage;
