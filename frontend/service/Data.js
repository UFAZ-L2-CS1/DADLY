import { AxiosInstance } from './AxiosInstance';

const authHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const normalizeIngredientName = (name = '') => name.trim().toLowerCase();

export async function fetchRecipeFeed(limit = 20, exclude = []) {
  try {
    const params = { limit };
    if (exclude.length) {
      params.exclude = exclude.join(',');
    }
    const response = await AxiosInstance.get('/recipes/feed', {
      params,
      headers: authHeaders(),
    });
    return response.data;
  } catch (err) {
    console.error('Error fetching recipe feed:', err);
    throw err;
  }
}

export async function fetchRecipeDetails(recipeId) {
  try {
    const response = await AxiosInstance.get(`/recipes/${recipeId}`, {
      headers: authHeaders(),
    });
    return response.data;
  } catch (err) {
    console.error(`Error fetching recipe ${recipeId}:`, err);
    throw err;
  }
}

export async function fetchLikedRecipes(limit = 100) {
  try {
    const response = await AxiosInstance.get('/recipes/liked', {
      params: { limit },
      headers: authHeaders(),
    });
    return response.data;
  } catch (err) {
    console.error('Error fetching liked recipes:', err);
    throw err;
  }
}

export async function likeRecipe(recipeId) {
  try {
    const response = await AxiosInstance.post(
      `/recipes/${recipeId}/like`,
      {},
      { headers: authHeaders() }
    );
    return response.data;
  } catch (err) {
    console.error(`Error liking recipe ${recipeId}:`, err);
    throw err;
  }
}

export async function unlikeRecipe(recipeId) {
  try {
    const response = await AxiosInstance.delete(`/recipes/${recipeId}/like`, {
      headers: authHeaders(),
    });
    return response.data;
  } catch (err) {
    console.error(`Error unliking recipe ${recipeId}:`, err);
    throw err;
  }
}

export async function savePantryIngredient(ingredientName, quantity = '1') {
  const normalized = normalizeIngredientName(ingredientName);
  if (!normalized) return;

  try {
    await AxiosInstance.post(
      '/pantry/',
      {
        ingredient_name: normalized,
        quantity,
      },
      {
        headers: {
          ...authHeaders(),
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err) {
    if (err?.response?.status === 400) {
      return;
    }
    console.error('Error saving pantry ingredient:', err);
    throw err;
  }
}


export async function savePantryIngredientsBulk(ingredientNames = []) {
  if (!Array.isArray(ingredientNames) || !ingredientNames.length) return;

  const seen = new Set();
  const ingredients = ingredientNames
    .map((name) => normalizeIngredientName(name))
    .filter((name) => name && !seen.has(name) && seen.add(name));

  if (!ingredients.length) return;

  const payload = {
    ingredients: ingredients.map((ingredient_name) => ({
      ingredient_name,
      quantity: '1',
    })),
  };

  try {
    await AxiosInstance.post('/pantry/bulk', payload, {
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.error('Error saving pantry ingredients in bulk:', err);
    throw err;
  }
}

export async function fetchPantryIngredients() {
  try {
    const response = await AxiosInstance.get('/pantry/', {
      headers: authHeaders(),
    });
    return response.data;
  } catch (err) {
    console.error('Error fetching pantry ingredients:', err);
    throw err;
  }
}

export async function deletePantryIngredient(ingredientId) {
  try {
    const response = await AxiosInstance.delete(`/pantry/${ingredientId}`, {
      headers: authHeaders(),
    });
    return response.data;
  } catch (err) {
    console.error(`Error deleting ingredient ${ingredientId}:`, err);
    throw err;
  }
}

export async function clearPantry() {
  try {
    const response = await AxiosInstance.delete('/pantry/', {
      headers: authHeaders(),
    });
    return response.data;
  } catch (err) {
    console.error('Error clearing pantry:', err);
    throw err;
  }
}
