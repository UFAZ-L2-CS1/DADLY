import { useEffect, useRef, useState, useContext } from "react";
import { ChevronDown, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { BsFillStarFill } from "react-icons/bs";
import { PiListHeartBold } from "react-icons/pi";
import { NAV_SECTIONS } from "../constants/navigation";
import DataContext from "../../context/DataContext";
// import { savePantryIngredient } from "../../service/Data";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const sideRef = useRef(null);
  const prevPathRef = useRef(location.pathname);
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedSubItems, setExpandedSubItems] = useState({});
  const { currentUser } = useContext(DataContext);

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const toggleSubItem = (sectionId, itemName) => {
    const key = `${sectionId}-${itemName}`;
    setExpandedSubItems((prev) => {
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

  const handleIngredientSelect = (url = '', fallback = '') => {
    const value = extractIngredientValue(url, fallback).trim();
    if (!value || !currentUser) return;
    // savePantryIngredient(value).catch((err) => {
    //   console.error('Failed to save pantry selection:', err);
    // });
  };

  // Close sidebar on escape key
  useEffect(() => {
    if (!isOpen) {
      setExpandedSections({});
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Close sidebar on route change
  useEffect(() => {
    const hasPathChanged = prevPathRef.current !== location.pathname;
    if (hasPathChanged && isOpen) {
      onClose();
    }
    prevPathRef.current = location.pathname;
  }, [location.pathname, isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        ref={sideRef}
        className={`fixed left-0 top-0 h-full w-[280px] bg-white shadow-2xl z-[101] lg:hidden transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#E64C15]">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-orange-50 transition-colors text-gray-600 hover:text-[#E64C15]"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="overflow-y-auto h-[calc(100%-73px)]">
          <div className="py-2">
            {/* Rate Us & Favourites Section */}
            <div className="border-b border-gray-100 pb-2 mb-2">
              {/* Rate Us */}
              {currentUser ? (
                <button className='w-full flex items-center gap-3 px-6 py-4 text-gray-700 hover:text-[#E64C15] hover:bg-orange-50 transition-colors group'>
                  <BsFillStarFill size={20} className="text-gray-400 group-hover:text-[#E64C15] transition-colors" />
                  <span className="font-medium">Rate Us</span>
                </button>
              ) : (
                <Link 
                  to='/auth/token' 
                  className='w-full flex items-center gap-3 px-6 py-4 text-gray-700 hover:text-[#E64C15] hover:bg-orange-50 transition-colors group'
                >
                  <BsFillStarFill size={20} className="text-gray-400 group-hover:text-[#E64C15] transition-colors" />
                  <span className="font-medium">Rate Us</span>
                </Link>
              )}

              {/* Favourites */}
              <Link
                to={currentUser ? `/user/${currentUser?.id}/favourites` : '/auth/token'}
                className='w-full flex items-center justify-between px-6 py-4 text-gray-700 hover:text-[#E64C15] hover:bg-orange-50 transition-colors group'
              >
                <div className="flex items-center gap-3">
                  <PiListHeartBold size={20} className="text-gray-400 group-hover:text-[#E64C15] transition-colors" />
                  <span className="font-medium">Favourites</span>
                </div>
              </Link>
            </div>

            {/* Main Navigation Sections */}
            {NAV_SECTIONS.map((section) => {
              const isExpanded = expandedSections[section.id];
              const Icon = section.icon;
              const hasItems = section.items && section.items.length > 0;

              return (
                <div key={section.id} className="border-b border-gray-50">
                  {hasItems ? (
                    <>
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full flex items-center justify-between px-6 py-4 hover:bg-orange-50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            size={20}
                            className={`transition-colors ${
                              isExpanded ? "text-[#E64C15]" : "text-gray-400 group-hover:text-[#E64C15]"
                            }`}
                          />
                          <span
                            className={`font-medium transition-colors ${
                              isExpanded ? "text-[#E64C15]" : "text-gray-700 group-hover:text-[#E64C15]"
                            }`}
                          >
                            {section.label}
                          </span>
                        </div>

                        <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                          <ChevronDown 
                            size={18} 
                            className={isExpanded ? "text-[#E64C15]" : "text-gray-400 group-hover:text-[#E64C15]"}
                          />
                        </div>
                      </button>

                      {/* Dropdown Items */}
                      <div
                        className={`bg-gray-50 overflow-hidden transition-all duration-300 ${
                          isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        {section.items.map((item) => {
                          const hasSubItems = item.subItems && item.subItems.length > 0;
                          const subKey = `${section.id}-${item.name}`;
                          const isSubExpanded = !!expandedSubItems[subKey];

                          if (hasSubItems) {
                            return (
                              <div key={item.name} className="pl-10 pr-6 py-2">
                                <button
                                  type="button"
                                  onClick={() => toggleSubItem(section.id, item.name)}
                                  className="w-full flex items-center justify-between text-left text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-[#E64C15]"
                                >
                                  <span>{item.name}</span>
                                  <ChevronDown
                                    size={16}
                                    className={`transition-transform ${isSubExpanded ? 'rotate-180 text-[#E64C15]' : ''}`}
                                  />
                                </button>
                                <div
                                  className={`flex flex-col border-l border-gray-200 ml-2 mt-2 transition-all duration-300 ${
                                    isSubExpanded ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                                  }`}
                                >
                                  {isSubExpanded &&
                                    item.subItems.map((subItem) => (
                                      <Link
                                        key={subItem.name}
                                        to={subItem.url}
                                        className="block pl-4 pr-2 py-2 text-sm text-gray-600 hover:text-[#E64C15] hover:bg-orange-50 transition-colors"
                                        onClick={() => handleIngredientSelect(subItem.url, subItem.name)}
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
                              className="block pl-14 pr-6 py-3 text-sm text-gray-600 hover:text-[#E64C15] hover:bg-orange-50 transition-colors"
                              onClick={() => {
                                if (section.id === 'ingredients') {
                                  handleIngredientSelect(item.url, item.name);
                                }
                              }}
                            >
                              {item.name}
                            </Link>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <Link
                      to={section.href}
                      className="w-full flex items-center px-6 py-4 hover:bg-orange-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          size={20}
                          className="text-gray-400 group-hover:text-[#E64C15] transition-colors"
                        />
                        <span className="font-medium text-gray-700 group-hover:text-[#E64C15] transition-colors">
                          {section.label}
                        </span>
                      </div>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
