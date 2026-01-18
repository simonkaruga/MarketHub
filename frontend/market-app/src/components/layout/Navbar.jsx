import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiSearch, FiChevronDown } from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHomeDropdownOpen, setIsHomeDropdownOpen] = useState(false);
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout, isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const homeDropdownRef = useRef(null);
  const aboutDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (homeDropdownRef.current && !homeDropdownRef.current.contains(event.target)) {
        setIsHomeDropdownOpen(false);
      }
      if (aboutDropdownRef.current && !aboutDropdownRef.current.contains(event.target)) {
        setIsAboutDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    navigate('/');
  };

  // Normalize role to lowercase for comparison
  const userRole = user?.role?.toLowerCase();

  return (
    <nav className="bg-[#0f172a] shadow-lg sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img src="/hub.png" alt="MarketHub Logo" className="h-12 w-12 object-contain" />
            <span className="text-2xl font-bold text-orange-400">MarketHub</span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
            </div>
          </form>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Home Dropdown */}
            <div className="relative" ref={homeDropdownRef}>
              <button
                onClick={() => setIsHomeDropdownOpen(!isHomeDropdownOpen)}
                className="flex items-center space-x-1 text-gray-300 hover:text-orange-400 py-2 px-3 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <span>Home</span>
                <FiChevronDown size={14} className={`transition-transform ${isHomeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Home Dropdown Menu */}
              {isHomeDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-slate-800 rounded-xl shadow-lg border border-slate-600 py-2 z-50">
                  <Link
                    to="/"
                    className="block px-4 py-2 text-gray-300 hover:bg-slate-700 transition-colors"
                    onClick={() => setIsHomeDropdownOpen(false)}
                  >
                    Home Page
                  </Link>
                  <Link
                    to="/login"
                    className="block px-4 py-2 text-gray-300 hover:bg-slate-700 transition-colors"
                    onClick={() => setIsHomeDropdownOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-2 text-orange-400 hover:bg-slate-700 font-medium transition-colors"
                    onClick={() => setIsHomeDropdownOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* About Dropdown */}
            <div className="relative" ref={aboutDropdownRef}>
              <button
                onClick={() => setIsAboutDropdownOpen(!isAboutDropdownOpen)}
                className="flex items-center space-x-1 text-gray-300 hover:text-orange-400 py-2 px-3 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <span>About</span>
                <FiChevronDown size={14} className={`transition-transform ${isAboutDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* About Dropdown Menu */}
              {isAboutDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-slate-800 rounded-xl shadow-lg border border-slate-600 py-2 z-50">
                  <Link
                    to="/about"
                    className="block px-4 py-2 text-gray-300 hover:bg-slate-700 transition-colors"
                    onClick={() => setIsAboutDropdownOpen(false)}
                  >
                    About Us
                  </Link>
                  <Link
                    to="/login"
                    className="block px-4 py-2 text-gray-300 hover:bg-slate-700 transition-colors"
                    onClick={() => setIsAboutDropdownOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-2 text-orange-400 hover:bg-slate-700 font-medium transition-colors"
                    onClick={() => setIsAboutDropdownOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            <Link to="/products" className="text-gray-300 hover:text-orange-400">
              Products
            </Link>
            <Link to="/become-merchant" className="text-gray-300 hover:text-orange-400">
              Sell on MarketHub
            </Link>

            {isAuthenticated ? (
              <>
                {/* Cart */}
                <Link to="/cart" className="relative text-gray-300 hover:text-orange-400">
                  <FiShoppingCart size={24} />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>

                {/* User Menu - Click-based dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 text-gray-300 hover:text-orange-400 py-2 px-3 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <FiUser size={22} />
                    <span className="max-w-[120px] truncate">{user?.name}</span>
                    <FiChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-xl shadow-lg border border-slate-600 py-2 z-50">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-slate-600">
                        <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-orange-500 text-white rounded-full capitalize">
                          {userRole}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-gray-300 hover:bg-slate-700 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          My Profile
                        </Link>
                        <Link
                          to="/orders"
                          className="block px-4 py-2 text-gray-300 hover:bg-slate-700 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          My Orders
                        </Link>

                        {userRole === 'customer' && (
                          <Link
                            to="/apply-merchant"
                            className="block px-4 py-2 text-orange-400 hover:bg-slate-700 font-medium transition-colors"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            Become a Merchant
                          </Link>
                        )}

                        {userRole === 'merchant' && (
                          <Link
                            to="/merchant/dashboard"
                            className="block px-4 py-2 text-gray-300 hover:bg-slate-700 transition-colors"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            Merchant Dashboard
                          </Link>
                        )}

                        {userRole === 'admin' && (
                          <Link
                            to="/admin/dashboard"
                            className="block px-4 py-2 text-orange-400 hover:bg-slate-700 font-medium transition-colors"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            Admin Dashboard
                          </Link>
                        )}

                        {userRole === 'hub_staff' && (
                          <Link
                            to="/hub/dashboard"
                            className="block px-4 py-2 text-gray-300 hover:bg-slate-700 transition-colors"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            Hub Dashboard
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-slate-600 pt-1">
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-red-400 hover:bg-slate-700 transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-orange-400">
                  Login
                </Link>
                <Link to="/register" className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-300 hover:text-orange-400"
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                />
                <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
              </div>
            </form>

            {/* Home Section */}
            <div className="mb-4">
              <div className="font-semibold text-gray-900 mb-2">Home</div>
              <Link to="/" className="block py-2 pl-4 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                Home Page
              </Link>
              <Link to="/login" className="block py-2 pl-4 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="block py-2 pl-4 text-primary-600 font-medium" onClick={() => setIsMenuOpen(false)}>
                Sign Up
              </Link>
            </div>

            {/* About Section */}
            <div className="mb-4">
              <div className="font-semibold text-gray-900 mb-2">About</div>
              <Link to="/about" className="block py-2 pl-4 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                About Us
              </Link>
              <Link to="/login" className="block py-2 pl-4 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="block py-2 pl-4 text-primary-600 font-medium" onClick={() => setIsMenuOpen(false)}>
                Sign Up
              </Link>
            </div>

            <Link to="/products" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
              Products
            </Link>
            <Link to="/become-merchant" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
              Sell on MarketHub
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/cart" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                  Cart ({itemCount})
                </Link>
                <Link to="/profile" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                  My Profile
                </Link>
                <Link to="/orders" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                  My Orders
                </Link>

                {userRole === 'merchant' && (
                  <Link to="/merchant/dashboard" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                    Merchant Dashboard
                  </Link>
                )}

                {userRole === 'admin' && (
                  <Link to="/admin/dashboard" className="block py-2 text-primary-600 font-medium" onClick={() => setIsMenuOpen(false)}>
                    Admin Dashboard
                  </Link>
                )}

                {userRole === 'hub_staff' && (
                  <Link to="/hub/dashboard" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                    Hub Dashboard
                  </Link>
                )}

                <button onClick={handleLogout} className="block py-2 text-red-600 mt-2">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="block py-2 text-primary-600" onClick={() => setIsMenuOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
