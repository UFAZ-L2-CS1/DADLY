import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, X, ShoppingBasket } from 'lucide-react';
import DataContext from '../../context/DataContext';
import {
  fetchPantryIngredients,
  savePantryIngredient,
  savePantryIngredientsBulk,
  deletePantryIngredient,
  clearPantry,
} from '../../service/Data';

export default function Pantry() {
  const { currentUser, loading: userLoading } = useContext(DataContext);
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newIngredient, setNewIngredient] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [addingIngredient, setAddingIngredient] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userLoading && !currentUser) {
      navigate('/auth/token');
    }
  }, [currentUser, userLoading, navigate]);

  // Fetch pantry ingredients
  const loadPantryItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPantryIngredients();
      setIngredients(data);
    } catch (err) {
      setError('Failed to load pantry items. Please try again.');
      console.error('Error loading pantry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadPantryItems();
    }
  }, [currentUser]);

  // Add single ingredient
  const handleAddIngredient = async (e) => {
    e.preventDefault();
    if (!newIngredient.trim()) return;

    try {
      setAddingIngredient(true);
      setError(null);
      await savePantryIngredient(newIngredient.trim(), newQuantity || '1');
      setNewIngredient('');
      setNewQuantity('');
      await loadPantryItems(); // Refresh list
    } catch (err) {
      if (err?.response?.status === 400) {
        setError(`"${newIngredient.trim()}" already exists in your pantry`);
      } else {
        setError('Failed to add ingredient. Please try again.');
      }
    } finally {
      setAddingIngredient(false);
    }
  };

  // Add multiple ingredients (bulk)
  const handleBulkAdd = async () => {
    if (!bulkInput.trim()) return;

    const ingredientList = bulkInput
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line);

    if (ingredientList.length === 0) return;

    try {
      setAddingIngredient(true);
      setError(null);
      await savePantryIngredientsBulk(ingredientList);
      setBulkInput('');
      setShowBulkInput(false);
      await loadPantryItems(); // Refresh list
    } catch (error) {
      console.error('Failed to add pantry ingredients:', error);
      setError('Failed to add ingredients. Please try again.');
    } finally {
      setAddingIngredient(false);
    }
  };

  // Delete single ingredient
  const handleDeleteIngredient = async (ingredientId) => {
    try {
      await deletePantryIngredient(ingredientId);
      setIngredients((prev) => prev.filter((item) => item.id !== ingredientId));
    } catch (error) {
      console.error('Failed to delete pantry ingredient:', error);
      setError('Failed to delete ingredient. Please try again.');
    }
  };

  // Clear all ingredients
  const handleClearPantry = async () => {
    if (!window.confirm('Are you sure you want to clear your entire pantry?')) {
      return;
    }

    try {
      await clearPantry();
      setIngredients([]);
    } catch (error) {
      console.error('Failed to clear pantry:', error);
      setError('Failed to clear pantry. Please try again.');
    }
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your pantry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBasket className="w-8 h-8 text-orange-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">My Pantry</h1>
                <p className="text-gray-600 mt-1">
                  {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            {ingredients.length > 0 && (
              <button
                onClick={handleClearPantry}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Add Ingredient Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Ingredients</h2>

          {/* Single Add */}
          <form onSubmit={handleAddIngredient} className="mb-4">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Ingredient name (e.g., tomatoes)"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Quantity (optional)"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={addingIngredient || !newIngredient.trim()}
                className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add
              </button>
            </div>
          </form>

          {/* Bulk Add Toggle */}
          <button
            onClick={() => setShowBulkInput(!showBulkInput)}
            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
          >
            {showBulkInput ? 'Hide bulk add' : 'Add multiple ingredients at once'}
          </button>

          {/* Bulk Add */}
          {showBulkInput && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter ingredients (one per line):
              </label>
              <textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="tomatoes&#10;onions&#10;garlic&#10;olive oil"
                rows="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button
                onClick={handleBulkAdd}
                disabled={addingIngredient || !bulkInput.trim()}
                className="mt-3 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Add All Ingredients
              </button>
            </div>
          )}
        </div>

        {/* Ingredients List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Ingredients</h2>

          {ingredients.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBasket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Your pantry is empty</p>
              <p className="text-gray-400 text-sm mt-2">
                Add ingredients to get personalized recipe recommendations
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {ingredients.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 capitalize">
                      {item.ingredient_name}
                    </p>
                    {item.quantity && (
                      <p className="text-sm text-gray-600">{item.quantity}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteIngredient(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Delete ingredient"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        {ingredients.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              💡 <strong>Tip:</strong> The recipe feed will prioritize recipes that match your
              pantry ingredients!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
