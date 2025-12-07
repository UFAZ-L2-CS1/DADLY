import { AxiosInstance } from './AxiosInstance';

const authHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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
