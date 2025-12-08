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
import { NAV_SECTIONS } from '../constants/navigation';
// import { savePantryIngredient } from '../../service/Data';

export const Navbar = () => {
  const [openSidebar, setOpenSidebar] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [searchValue, setSearchValue] = useState('');
  const userDropdownRef = useRef(null);
  const navDropdownRef = useRef(null);
  const navigate = useNavigate();
  
  const { currentUser, setCurrentUser } = useContext(DataContext);

  const extractIngredientValue = (url = '', fallback = '') => {
    try {
      const [, query] = url.split('?');
      if (!query) return fallback;
      const params = new URLSearchParams(query);
      return params.get('ingredient') || fallback;
    } catch {
      return fallback;
    }
  };

  // const handleIngredientSelect = (url = '', fallback = '') => {
  //   const value = extractIngredientValue(url, fallback).trim();
  //   if (!value || !currentUser) return;
  //   savePantryIngredient(value).catch((err) => {
  //     console.error('Failed to save pantry selection:', err);
  //   });
  // };

  // Toggle submenu
  const toggleSubmenu = (sectionId, itemName) => {
    const key = `${sectionId}-${itemName}`;
    setOpenSubmenus((prev) => {
      const isOpen = !!prev[key];
      const next = {};

      Object.entries(prev).forEach(([entryKey, value]) => {
        if (!entryKey.startsWith(`${sectionId}-`)) {
          next[entryKey] = value;
        }
      });

      if (!isOpen) {
        next[key] = true;
      }

      return next;
    });
  };

  // Sign out function
  const handleSignOut = () => {
    localStorage.clear();
    setCurrentUser(null);
    setUserDropdown(false);
    navigate('/');
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Close user dropdown
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdown(false);
      }
      
      // Close nav dropdown and submenus
      if (navDropdownRef.current && !navDropdownRef.current.contains(e.target)) {
        // Check if click is not on a submenu trigger
        const isSubmenuTrigger = e.target.closest('[data-submenu-trigger]');
        if (!isSubmenuTrigger) {
          setActiveDropdown(null);
          setOpenSubmenus({});
        }
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navSections = NAV_SECTIONS;

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
                {currentUser ? (
                  <button className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#E64C15] hover:bg-orange-50 rounded-lg transition-all'>
                    <BsFillStarFill size={16} />
                    <span>Rate Us</span>
                  </button>
                ) : (
                  <Link 
                    to='/auth/token' 
                    className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#E64C15] hover:bg-orange-50 rounded-lg transition-all'
                  >
                    <BsFillStarFill size={16} />
                    <span>Rate Us</span>
                  </Link>
                )}

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
                  <div ref={userDropdownRef} className='relative'>
                    <button
                      onClick={() => setUserDropdown(!userDropdown)}
                      className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#E64C15] hover:bg-orange-50 rounded-lg transition-all'
                    >
                      <CgProfile size={20} />
                      <span className='max-w-[100px] truncate'>{currentUser?.name}</span>
                      <RiArrowDropDownLine 
                        size={20} 
                        className={`transition-transform duration-200 ${userDropdown ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* User Dropdown Menu */}
                    {userDropdown && (
                      <div className='absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200'>
                        <Link 
                          className='block px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#E64C15] transition-colors' 
                          to={`/user/${currentUser?.id}/favourites`}
                          onClick={() => setUserDropdown(false)}
                        >
                          Your Favourites
                        </Link>
                       
                        <Link 
                          className='block px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#E64C15] transition-colors' 
                          to={`/user/${currentUser?.id}/rateHistory`}
                          onClick={() => setUserDropdown(false)}
                        >
                          Your Ratings
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
                  <div ref={userDropdownRef} className='relative'>
                    <button
                      onClick={() => setUserDropdown(!userDropdown)}
                      className='flex items-center gap-1 px-3 py-2 text-sm font-medium text-[#E64C15] hover:bg-orange-50 rounded-lg transition-all'
                    >
                      <CgProfile size={20} />
                      <RiArrowDropDownLine 
                        size={20} 
                        className={`transition-transform duration-200 ${userDropdown ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* User Dropdown Menu - Mobile */}
                    {userDropdown && (
                      <div className='absolute right-0  top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200'>
                        
                        <Link 
                          className='block px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#E64C15] transition-colors' 
                          to={`/user/${currentUser?.id}/rateHistory`}
                          onClick={() => setUserDropdown(false)}
                        >
                          Your Ratings
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
              <nav className='hidden lg:flex gap-2 items-center' ref={navDropdownRef}>
                {navSections.map((section) => {
                  const hasItems = section.items && section.items.length > 0;
                  const isActive = activeDropdown === section.id;

                  return (
                    <div key={section.id} className='relative'>
                      {hasItems ? (
                        <button
                          onClick={() => {
                            setActiveDropdown(isActive ? null : section.id);
                            if (isActive) {
                              setOpenSubmenus({});
                            }
                          }}
                          className={`flex items-center gap-1 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                            isActive 
                              ? 'text-[#E64C15] border-[#E64C15]' 
                              : 'text-gray-600 border-transparent hover:text-[#E64C15] hover:border-[#E64C15]'
                          }`}
                        >
                          {section.label}
                          <RiArrowDropDownLine 
                            size={20} 
                            className={`transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`}
                          />
                        </button>
                      ) : (
                        <Link
                          to={section.href}
                          className='flex items-center gap-1 px-4 py-3 text-sm font-medium text-gray-600 hover:text-[#E64C15] border-b-2 border-transparent hover:border-[#E64C15] transition-all'
                        >
                          {section.label}
                        </Link>
                      )}

                      {/* Desktop Dropdown */}
                      {isActive && hasItems && (
                        <div className='absolute top-full left-0 mt-5 min-w-[260px] bg-white rounded-b-lg shadow-lg border border-gray-100 border-t-0 py-3 animate-in fade-in slide-in-from-top-2 duration-200'>
                          {section.items.map((item) => {
                            const hasSubItems = item.subItems && item.subItems.length > 0;
                            const submenuKey = `${section.id}-${item.name}`;
                            const isSubmenuOpen = !!openSubmenus[submenuKey];

                            if (hasSubItems) {
                              return (
                                <div key={item.name} className='px-4 py-2 border-b border-gray-50 last:border-b-0'>
                                  <button
                                    type='button'
                                    onClick={() => toggleSubmenu(section.id, item.name)}
                                    data-submenu-trigger={submenuKey}
                                    className='w-full flex items-center justify-between text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500 hover:text-[#E64C15] transition-colors'
                                  >
                                    <span>{item.name}</span>
                                    <RiArrowDropDownLine
                                      size={18}
                                      className={`transition-transform ${isSubmenuOpen ? 'rotate-180 text-[#E64C15]' : ''}`}
                                    />
                                  </button>
                                  <div
                                    className={`flex flex-col gap-1 mt-2 transition-all duration-200 ${
                                      isSubmenuOpen ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
                                    }`}
                                  >
                                    {isSubmenuOpen &&
                                      item.subItems.map((subItem) => (
                                        <Link
                                          key={subItem.name}
                                          to={subItem.url}
                                          className='block px-2 py-1.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#E64C15] rounded-md transition-colors'
                                          onClick={() => {
                                            setActiveDropdown(null);
                                            setOpenSubmenus({});
                                            // handleIngredientSelect(subItem.url, subItem.name);
                                          }}
                                        >
                                          {subItem.name}
                                        </Link>
                                      ))}
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <Link
                                key={item.name}
                                to={item.url}
                                className='block px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#E64C15] transition-colors'
                                onClick={() => {
                                  setActiveDropdown(null);
                                  setOpenSubmenus({});
                                  // if (section.id === 'ingredients') {
                                  //   handleIngredientSelect(item.url, item.name);
                                  // }
                                }}
                              >
                                {item.name}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>

              {/* Search Bar */}
              <div className='relative flex-1 lg:max-w-sm'>
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder='Search for "pasta"'
                  className='w-full pl-10 pr-4 py-2 text-sm border-2 border-gray-200 rounded-lg outline-none focus:border-[#E64C15] transition-colors placeholder:text-gray-400'
                />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className='h-[140px]' />

      {/* Sidebar */}
      <Sidebar isOpen={openSidebar} onClose={() => setOpenSidebar(false)} />
    </>
  );
};
