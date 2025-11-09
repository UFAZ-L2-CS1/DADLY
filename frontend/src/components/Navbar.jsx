import React, { useContext, useEffect, useState, useRef } from 'react'
import logo from './../assets/logoDadly.png'
import { dataCntxt } from '../../context/DataContext'
import { useNavigate, Link } from 'react-router-dom'
import { BsFillStarFill } from "react-icons/bs";
import { PiListHeartBold } from "react-icons/pi";
import { CgProfile } from "react-icons/cg";
import { HiMenuAlt1 } from "react-icons/hi";
import Sidebar from './Sidebar';
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [open,setOpen]=useState(false);
  const [user, setUser] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const selectorRef = useRef(null);
  const navigate = useNavigate();

  const { currentUser, setCurrentUser } = useContext(dataCntxt);

  console.log(currentUser?.name);



  function handleUserData() {
    setUserDropdown((prev) => !prev);
  }

  function handleSignOut() {
    localStorage.removeItem('user');
    setCurrentUser(null);
    setUser(false);
    setUserDropdown(false);
    navigate('/');
  }

  useEffect(() => {
    if (localStorage.getItem('user')) {
      setUser(true);
    }
    const handleClickOutside = (e) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <section className='bg-[#fcf8f4] border-b-[0.5px] border-[#ecdacb] fixed w-full px-18 z-50'>
      <nav className='flex justify-between items-center max-w-[1400px]  mx-auto '>
        <Link to="/" className='w-15 py-2 '><img src={logo} alt="Dadly logo" /></Link>
        <div>
          <button className='lg:hidden border-[#EB7A30] border-2 cursor-pointer text-[#EB7A30]  px-4 text-sm py-2 rounded-full flex items-center gap-2 hover:text-[#DF4B2D] hover:border-[#DF4B2D] hover:bg-[#f5e5d646] transition' onClick={() => setOpen(!open)}>
            <HiMenuAlt1 /></button> 
            <Sidebar/></div>
        <div className='hidden lg:flex '> <ul className='flex font-semibold text-[#EB7A30] '>
          <li className='hover:text-[#DF4B2D] py-8 px-4 items-center justify-center border-b-2 border-transparent  transiton  transition-all hover:border-[#DF4B2D] flex hover:bg-[#f5e5d646] '><Link to="/">Meal Game</Link></li>
          <li className='hover:text-[#DF4B2D] py-8 px-4 items-center justify-center border-b-2 border-transparent  transiton  transition-all hover:border-[#DF4B2D] flex hover:bg-[#f5e5d646] '><Link to="/about">Recipes</Link></li>
          <li className='hover:text-[#DF4B2D] py-8 px-4 items-center justify-center border-b-2 border-transparent  transiton  transition-all hover:border-[#DF4B2D] flex hover:bg-[#f5e5d646] '><Link to="/contact">Diet Plans</Link></li>
          <li className='hover:text-[#DF4B2D] py-8 px-4 items-center justify-center border-b-2 border-transparent  transiton  transition-all hover:border-[#DF4B2D] flex hover:bg-[#f5e5d646] '><Link to="/about-us">About Us</Link></li>
        </ul>
          <div className='flex gap-2'>
            {user ? <button onClick={() => openRate()} className='border-[#EB7A30] border-2 cursor-pointer text-[#EB7A30]  px-4 text-sm py-2 rounded-full flex items-center gap-2 hover:text-[#DF4B2D] hover:border-[#DF4B2D] hover:bg-[#f5e5d646] transition'>
              <BsFillStarFill />
              Rate Us
            </button> : <Link to='/token' className='border-[#EB7A30] border-2 cursor-pointer text-[#EB7A30]  px-4 text-sm py-2 rounded-full flex items-center gap-2 hover:text-[#DF4B2D] hover:border-[#DF4B2D] hover:bg-[#f5e5d646] transition'>
              <BsFillStarFill />
              Rate Us
            </Link>}
            <Link to={`${user ? `/user/ur${currentUser?.id}/watchList` : '/token'}`} className='border-[#EB7A30] border-2 cursor-pointer text-[#EB7A30] px-4 text-sm py-2 rounded-full flex items-center gap-2 hover:text-[#DF4B2D] hover:border-[#DF4B2D] hover:bg-[#f5e5d646] transition'>
              <PiListHeartBold className='text-[20px]' />
              Favourites
              {user ? <p className='px-2 bg-[#EB7A30] text-white rounded-full text-[0.7rem]'>{currentUser?.watchList?.length}</p> : ''}
            </Link>

            {!user ? (
              <Link to='/token' className='border-[#EB7A30] border-2 cursor-pointer text-[#EB7A30] px-4 text-sm py-2 rounded-full flex items-center gap-2 hover:text-[#DF4B2D] hover:border-[#DF4B2D] hover:bg-[#f5e5d646] transition'>
                <CgProfile className='text-[20px]' />
                Sign in/Sign up
              </Link>
            ) : (
              <div className='flex  relative gap-2 text-white rounded-full px-4 py-1 hover:bg-white/10 cursor-pointer' onClick={() => handleUserData()}>
                <Link className='border-[#EB7A30] border-2 cursor-pointer text-[#EB7A30] px-4 text-sm py-2 rounded-full flex items-center gap-2 hover:text-[#DF4B2D] hover:border-[#DF4B2D] hover:bg-[#f5e5d646] transition'>
                  <CgProfile className='text-[20px]' />{currentUser?.name}
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className={`${userDropdown ? 'rotate-180' : ''} transition-all duration-200 ease-in-out `} viewBox="0 0 24 24" fill="currentColor" role="presentation"><path fill="none" d="M0 0h24v24H0V0z"></path><path d="M8.71 11.71l2.59 2.59c.39.39 1.02.39 1.41 0l2.59-2.59c.63-.63.18-1.71-.71-1.71H9.41c-.89 0-1.33 1.08-.7 1.71z"></path></svg>
                </Link>

                {userDropdown && (
                  <div className='bg-[#121212] border-1 rounded-sm border-[#ffffff1a] z-40 right-0 py-2 absolute text-white flex top-11 text-lg w-55 flex-col'>
                    <Link className='px-8 py-2 hover:bg-white/10' to={`/user/${currentUser?.id}/watchList`}>Your Favourites</Link>
                    <Link className='px-8 py-2 hover:bg-white/10' to={`/user/${currentUser?.id}/watchHistory`}>Your watch history</Link>
                    <Link className='px-8 py-2 hover:bg-white/10' to={`/user/${currentUser?.id}/rateHistory`}>Your ratings</Link>
                    <span className='px-8 py-2 hover:bg-white/10 cursor-pointer' onClick={handleSignOut}>Sign out</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </section>
  )
}

export default Navbar
