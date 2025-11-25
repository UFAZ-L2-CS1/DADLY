import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary.jsx';
import Home from './pages/Home';

import SignIn from './pages/SignIn.jsx';
import Register from './pages/Register.jsx';
import MainLayout from './layout/MainLayout.jsx';
import DataContext from '../context/DataContext.jsx'; // Import your context provider

function App() {
  return (
    <ErrorBoundary>
      <DataContext>
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
      </DataContext>
    </ErrorBoundary>
  );
}

export default App;
