import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary.jsx'; // Ensure the path matches your project structure
import Home from './pages/Home';
import Account from './pages/Account.jsx';
import SignIn from './pages/SignIn.jsx';
import Register from './pages/Register.jsx';
import MainLayout from './layout/MainLayout.jsx';

// import NotFound from './pages/NotFound'; // Example of a 404 page
// import About from './About'; // Example of another page

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path='/' element={<MainLayout />}>
            <Route index element={<Home />} />
            {/* <Route path="/user/:id/account" element={<Account />} /> */}
            
          </Route>
          <Route path="/token" element={<SignIn />} />
            <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
