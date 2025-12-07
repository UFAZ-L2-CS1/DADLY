import { useEffect, useRef, useState, useContext } from "react";
import { ChevronDown, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { BsFillStarFill } from "react-icons/bs";
import { PiListHeartBold } from "react-icons/pi";
import { NAV_SECTIONS } from "../constants/navigation";
import DataContext from "../../context/DataContext";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const sideRef = useRef(null);
  const prevPathRef = useRef(location.pathname);
  const [expandedSections, setExpandedSections] = useState({});
  const { currentUser } = useContext(DataContext);

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
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
                        {section.items.map((item) => (
                          <Link
                            key={item.name}
                            to={item.url}
                            className="block pl-14 pr-6 py-3 text-sm text-gray-600 hover:text-[#E64C15] hover:bg-orange-50 transition-colors"
                          >
                            {item.name}
                          </Link>
                        ))}
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
