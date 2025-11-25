import React, { useContext, useEffect, useState, useRef } from 'react';
import logo from './../assets/logoDadly.png';
import { dataCntxt } from '../../context/DataContext';
import { useNavigate, Link } from 'react-router-dom';
import { BsFillStarFill } from "react-icons/bs";
import { PiListHeartBold } from "react-icons/pi";
import { CgProfile } from "react-icons/cg";
import { HiMenuAlt1 } from "react-icons/hi";
import { FaSearch } from "react-icons/fa";
import Sidebar from './Sidebar';
import { RiArrowDropDownLine } from "react-icons/ri";
const Navbar = () => {
  const [openSidebar, setOpenSidebar] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const selectorRef = useRef(null);
  const navigate = useNavigate();
  const [placeholder, setPlaceholder] = useState(true);
  const { currentUser, setCurrentUser } = useContext(dataCntxt);

  // Toggle user dropdown menu
  const handleUserDropdown = () => setUserDropdown(prev => !prev);

  // Sign out function
  const handleSignOut = () => {
    localStorage.clear();
    setCurrentUser(null);
    setUserDropdown(false);
    navigate('/');
  };

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  return (
    <section className=' border-b-[0.5px] border-[#ecdacb] fixed w-full z-50'>
      <nav className='flex flex-col justify-between items-center '>
        <div className=' w-full  py-5 border-b-[0.5px] border-[#ecdacb]'>
          <div className='px-5 max-w-[1400px] mx-auto flex relative'>
            <div className='px-5 '>
              <button
                className='lg:hidden stack-sans-text text-2xl  cursor-pointer  py-2 rounded-full flex items-center gap-2 hover:text-[#DF4B2D] hover:border-[#DF4B2D]  transition'
                onClick={() => setOpenSidebar(!openSidebar)}
              >
                <HiMenuAlt1 />
              </button>
              {openSidebar && <Sidebar />}
            </div>
            <Link to="/" className='px-5 w-full flex items-center justify-center text-[#E64C15] text-4xl lilita-one-regular '>
              DADLY
            </Link>

            <div className='flex  tracking-wide text-[#00001381]  gap-2 absolute right-0 items-center'>
              {/* Rate Us Button */}
              {currentUser ? (
                <button
                  className='  px-4 text-sm py-2 rounded-full flex items-center gap-2 hover:text-[#DF4B2D] hover:border-[#DF4B2D]  transition'
                >
                  <BsFillStarFill /> Rate Us
                </button>
              ) : (
                <Link
                  to='/token'
                  className=' px-4 text-sm py-2 rounded-full flex items-center gap-2 hover:text-[#DF4B2D] hover:border-[#DF4B2D]  transition'
                >
                  <BsFillStarFill /> Rate Us
                </Link>
              )}

              {/* Favourites */}
              <Link
                to={currentUser ? `/user/${currentUser?.id}/watchList` : '/token'}
                className=' px-4 text-sm py-2 rounded-full flex items-center gap-2 hover:text-[#DF4B2D] hover:border-[#DF4B2D]  transition'
              >
                <PiListHeartBold className='text-[20px]' />
                Favourites
                {currentUser?.watchList?.length > 0 && (
                  <span className='px-2 bg-[#EB7A30] text-white rounded-full text-[0.7rem]'>{currentUser.watchList.length}</span>
                )}
              </Link>

              {/* Profile */}
              {!currentUser ? (
                <Link
                  to='/token'
                  className=' px-4 text-sm py-2 rounded-full flex items-center gap-2 hover:text-[#DF4B2D] hover:border-[#DF4B2D]  transition'
                >
                  <CgProfile className='text-[20px]' /> Sign in/Sign up
                </Link>
              ) : (
                <div ref={selectorRef} className='relative'>
                  <button
                    onClick={handleUserDropdown}
                    className='flex gap-2  rounded-full px-4 py-1 hover:bg-white/10 cursor-pointer  text-[#EB7A30]'
                  >
                    <CgProfile className='text-[20px]' /> {currentUser?.name}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      className={`${userDropdown ? 'rotate-180' : ''} transition-all duration-200`}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path fill="none" d="M0 0h24v24H0V0z"></path>
                      <path d="M8.71 11.71l2.59 2.59c.39.39 1.02.39 1.41 0l2.59-2.59c.63-.63.18-1.71-.71-1.71H9.41c-.89 0-1.33 1.08-.7 1.71z"></path>
                    </svg>
                  </button>

                  {userDropdown && (
                    <div className='bg-[#121212] border-1 rounded-sm border-[#ffffff1a] z-40 right-0 py-2 absolute text-white flex top-11 text-lg w-55 flex-col'>
                      <Link className='px-8 py-2 hover:bg-white/10' to={`/user/${currentUser?.id}/watchList`}>Your Favourites</Link>
                      <Link className='px-8 py-2 hover:bg-white/10' to={`/user/${currentUser?.id}/watchHistory`}>Your Watch History</Link>
                      <Link className='px-8 py-2 hover:bg-white/10' to={`/user/${currentUser?.id}/rateHistory`}>Your Ratings</Link>
                      <span className='px-8 py-2 hover:bg-white/10 cursor-pointer' onClick={handleSignOut}>Sign out</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>



        <div className='flex items-center justify-between max-w-[1400px] mx-auto stack-sans-text text-sm  tracking-wider text-[#535353] gap-2'>
          <ul className='hidden lg:flex'>
            <li className='hover:text-[#DF4B2D] py-8 px-4 flex items-center justify-center border-b-2 border-transparent hover:border-[#DF4B2D]  transition-all'>
              <Link to="/">Meal Game</Link>
              <RiArrowDropDownLine className='text-2xl' />
            </li>
            <li className='hover:text-[#DF4B2D] py-8 px-4 flex items-center justify-center border-b-2 border-transparent hover:border-[#DF4B2D]  transition-all'>
              <Link to="/about">Recipes</Link>
              <RiArrowDropDownLine className='text-2xl' />
            </li>
            <li className='hover:text-[#DF4B2D] py-8 px-4 flex items-center justify-center border-b-2 border-transparent hover:border-[#DF4B2D]  transition-all'>
              <Link to="/contact">Diet Plans</Link>
              <RiArrowDropDownLine className='text-2xl' />
            </li>
            <li className='hover:text-[#DF4B2D] py-8 px-4 flex items-center justify-center border-b-2 border-transparent hover:border-[#DF4B2D]  transition-all'>
              <Link to="/about-us">About Us</Link>
              <RiArrowDropDownLine className='text-2xl' />
            </li>
          </ul>
          <div className="relative">
            <style jsx>{`
    .search-input::placeholder {
      color: ${placeholder ? '#00001342' : 'white'};
      transition: all 0.2s;
    }
  `}</style>
            <input
              type="text"
              onInput={() => setPlaceholder(false)}
              placeholder='Search for "pasta"'
              className="search-input outline-none font-light w-full pl-8 focus:border-[#DF4B2D] border-2 p-2 h-full"
            />
            <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2" />
          </div>

        </div>
        

      </nav>
    
    </section>
  );
};

export default Navbar;
