import { useEffect, useRef, useContext } from "react";
import { X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { BsFillStarFill } from "react-icons/bs";
import { PiListHeartBold } from "react-icons/pi";
import DataContext from "../../context/DataContext";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Recipes", to: "/recipes" },
  { label: "Pantry", to: "/pantry" },
  { label: "Diet Plans", to: "/diet-plans" },
  { label: "About Us", to: "/about-us" },
];

const Sidebar = ({ isOpen, onClose, onRateClick }) => {
  const location = useLocation();
  const sideRef = useRef(null);
  const prevPathRef = useRef(location.pathname);
  const { currentUser } = useContext(DataContext);

  // Close sidebar on escape key
  useEffect(() => {
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
              <button
                type='button'
                onClick={() => {
                  onRateClick?.();
                  onClose();
                }}
                className='w-full flex items-center gap-3 px-6 py-4 text-gray-700 hover:text-[#E64C15] hover:bg-orange-50 transition-colors group'
              >
                <BsFillStarFill size={20} className="text-gray-400 group-hover:text-[#E64C15] transition-colors" />
                <span className="font-medium">Rate Us</span>
              </button>

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

            <div className="space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={onClose}
                  className={`flex items-center justify-between px-6 py-4 text-gray-700 hover:text-[#E64C15] hover:bg-orange-50 transition-colors ${
                    location.pathname === link.to ? 'bg-orange-50 text-[#E64C15]' : ''
                  }`}
                >
                  <span className="font-medium">{link.label}</span>
                  <span className="text-xs text-gray-400">›</span>
                </Link>
              ))}
            </div>

            <div className="mt-6 px-6">
              {currentUser ? (
                <Link
                  to="/user/profile"
                  onClick={onClose}
                  className="block w-full text-center rounded-full bg-[#E64C15] text-white font-semibold py-2.5 hover:bg-[#d8571d] transition-colors"
                >
                  User Profile
                </Link>
              ) : (
                <Link
                  to="/auth/token"
                  onClick={onClose}
                  className="block w-full text-center rounded-full border border-[#E64C15] text-[#E64C15] font-semibold py-2.5 hover:bg-[#fff0e8] transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
