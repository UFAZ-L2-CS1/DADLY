import React from 'react'
import {Navbar} from '../components/Navbar'
import Footer from '../components/Footer'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <div className='min-h-screen flex flex-col bg-white'>
      <Navbar />
      <main className='flex-1 '>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
