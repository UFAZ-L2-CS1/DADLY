import React, { useContext, useEffect, useState, useRef } from 'react';
import DataContext from '../../context/DataContext';
import { useNavigate, Link } from 'react-router-dom';
import { BsFillStarFill } from "react-icons/bs";
import { PiListHeartBold } from "react-icons/pi";
import { CgProfile } from "react-icons/cg";
import { HiMenuAlt1 } from "react-icons/hi";
import { FaSearch } from "react-icons/fa";
import { RiArrowDropDownLine } from "react-icons/ri";
import Sidebar from './Sidebar';
import RatePopup from './RatePopup';

export const Navbar = () => {
  const [openSidebar, setOpenSidebar] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showRateModal, setShowRateModal] = useState(false);

  // 👇 separate refs for desktop & mobile user menu
  const desktopUserDropdownRef = useRef(null);
  const mobileUserDropdownRef = useRef(null);

  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useContext(DataContext);

  const handleSignOut = () => {
    localStorage.clear();
    setCurrentUser(null);
    setUserDropdown(false);
    navigate('/');
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      const target = e.target;

      const clickedInsideUserMenu =
        (desktopUserDropdownRef.current &&
          desktopUserDropdownRef.current.contains(target)) ||
        (mobileUserDropdownRef.current &&
          mobileUserDropdownRef.current.contains(target));

      if (!clickedInsideUserMenu) {
        setUserDropdown(false);
      }

    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRateModalOpen = () => {
    setShowRateModal(true);
    setUserDropdown(false);
  };

  const handleRateModalClose = () => {
    setShowRateModal(false);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmed = searchValue.trim();
    if (trimmed) {
      navigate(`/recipes?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/recipes');
    }
    setSearchValue('');
    setUserDropdown(false);
  };

  return (
    <>
      <header className='fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm'>
        {/* Top Bar */}
        <div className='border-b border-gray-100'>
          <div className='max-w-[1400px] mx-auto px-5'>
            <div className='flex items-center justify-between h-20'>
              {/* Mobile Menu Button */}
              <button
                className='lg:hidden p-2 -ml-2 text-gray-600 hover:text-[#E64C15] hover:bg-orange-50 rounded-lg transition-all'
                onClick={() => setOpenSidebar(true)}
                aria-label='Open menu'
              >
                <HiMenuAlt1 size={24} />
              </button>

              {/* Logo */}
              <Link
                to="/"
                className='absolute left-1/2 -translate-x-1/2 lg:relative lg:left-0 lg:translate-x-0 text-[#E64C15] text-3xl lg:text-4xl font-bold lilita-one-regular hover:opacity-80 transition-opacity'
              >
                DADLY
              </Link>

              {/* Right Actions - Desktop Only */}
              <div className='hidden lg:flex items-center gap-1'>
                {/* Rate Us */}
                <button
                  type='button'
                  onClick={handleRateModalOpen}
                  className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#E64C15] hover:bg-orange-50 rounded-lg transition-all'
                >
                  <BsFillStarFill size={16} />
                  <span>Rate Us</span>
                </button>

                {/* Favourites */}
                <Link
                  to={currentUser ? `/user/${currentUser?.id}/favourites` : '/auth/token'}
                  className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#E64C15] hover:bg-orange-50 rounded-lg transition-all relative'
                >
                  <PiListHeartBold size={20} />
                  <span>Favourites</span>
                </Link>

                {/* Profile / Sign In - Desktop */}
                {!currentUser ? (
                  <Link
                    to='/auth/token'
                    className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#E64C15] hover:bg-[#d43f0f] rounded-lg transition-all'
                  >
                    <CgProfile size={20} />
                    <span>Sign In</span>
                  </Link>
                ) : (
                  <div ref={desktopUserDropdownRef} className='relative'>
                    <button
                      onClick={() => setUserDropdown((v) => !v)}
                      className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#E64C15] hover:bg-orange-50 rounded-lg transition-all'
                    >
                      <CgProfile size={20} />
                      <span className='max-w-[100px] truncate'>{currentUser?.name}</span>
                      <RiArrowDropDownLine
                        size={20}
                        className={`transition-transform duration-200 ${userDropdown ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {userDropdown && (
                      <div className='absolute right-0 top-full mt-2 w-48 bg-white z-100 rounded-lg shadow-lg border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200'>
                        <Link
                          className='block px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#E64C15] transition-colors'
                          to='/user/profile'
                          onClick={() => setUserDropdown(false)}
                        >
                          User Profile
                        </Link>
                        <hr className='my-2 border-gray-100' />
                        <button
                          className='block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors'
                          onClick={handleSignOut}
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile Button - Mobile Only */}
              <div className='lg:hidden'>
                {!currentUser ? (
                  <Link
                    to='/auth/token'
                    className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#E64C15] hover:bg-[#d43f0f] rounded-lg transition-all'
                  >
                    <CgProfile size={20} />
                    <span className='hidden sm:inline'>Sign In</span>
                  </Link>
                ) : (
                  <div ref={mobileUserDropdownRef} className='relative'>
                    <button
                      onClick={() => setUserDropdown((v) => !v)}
                      className='flex items-center gap-1 px-3 py-2 text-sm font-medium text-[#E64C15] hover:bg-orange-50 rounded-lg transition-all'
                    >
                      <CgProfile size={20} />
                      <RiArrowDropDownLine
                        size={20}
                        className={`transition-transform duration-200 ${userDropdown ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {userDropdown && (
                      <div className='absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200'>
                        <Link
                          className='block px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#E64C15] transition-colors'
                          to='/user/profile'
                          onClick={() => setUserDropdown(false)}
                        >
                          User Profile
                        </Link>
                        <hr className='my-2 border-gray-100' />
                        <button
                          className='block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors'
                          onClick={handleSignOut}
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Navigation & Search */}
        <div className='bg-white'>
          <div className='max-w-[1400px] mx-auto px-5'>
            <div className='flex items-center justify-between gap-4 py-3'>
              {/* Desktop Navigation */}
              <nav className='hidden lg:flex gap-4 text-sm text-gray-500'>
                <Link to='/' className='hover:text-[#E64C15] transition-colors'>Home</Link>
                <Link to='/recipes' className='hover:text-[#E64C15] transition-colors'>Recipes</Link>
                <Link to='/pantry' className='hover:text-[#E64C15] transition-colors'>Pantry</Link>
              </nav>

              {/* Search Bar */}
              <form className='relative flex-1 lg:max-w-sm' onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder='Search recipes by name...'
                  className='w-full pl-10 pr-4 py-2 text-sm border-2 border-gray-200 rounded-lg outline-none focus:border-[#E64C15] transition-colors placeholder:text-gray-400'
                />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className='h-[140px]' />

      <Sidebar
        isOpen={openSidebar}
        onClose={() => setOpenSidebar(false)}
        onRateClick={handleRateModalOpen}
      />
      {showRateModal && <RatePopup onClose={handleRateModalClose} />}
    </>
  );
};
