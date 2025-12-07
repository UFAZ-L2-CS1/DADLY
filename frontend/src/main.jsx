
import DataProvider from '../context/DataProvider.jsx'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'   // <- important: import tailwind css

ReactDOM.createRoot(document.getElementById('root')).render(
  <DataProvider>
    <App />
  </DataProvider>
)
