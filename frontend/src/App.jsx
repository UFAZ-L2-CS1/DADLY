import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary.jsx';
import Home from './pages/Home.jsx';
import Recipes from './pages/Recipes.jsx';
import RecipeDetails from './pages/RecipeDetails.jsx';
import DietPlans from './pages/DietPlans.jsx';
import About from './pages/About.jsx';
import SignIn from './pages/SignIn.jsx';
import Register from './pages/Register.jsx';
import MainLayout from './layout/MainLayout.jsx';
import UserPage from './pages/UserPage.jsx';
import RecipesPage from './components/RecipesPage.jsx';
import Pantry from './pages/Pantry.jsx';
import UserProfilePanel from './components/UserProfilePanel.jsx';
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path='/' element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path='recipes' element={<Recipes />} />
            <Route path='recipes/:id' element={<RecipeDetails />} />
            <Route path='diet-plans' element={<DietPlans />} />
            <Route path='about-us' element={<About />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path='pantry' element={<Pantry />} />
            <Route path='user/:userId/:listType' element={<UserPage />} />
            <Route path='user/profile' element={<UserProfilePanel />} />
          </Route>
          <Route path='/auth/token' element={<SignIn />} />
          <Route path='/auth/register' element={<Register />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
