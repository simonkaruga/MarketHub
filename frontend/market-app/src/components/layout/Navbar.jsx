import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiSearch } from 'react-icons/fi';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout, isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-600">MarketHub</span>
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
            <Link to="/products" className="text-gray-700 hover:text-primary-600">
              Products
            </Link>

            {isAuthenticated ? (
              <>
                {/* Cart */}
                <Link to="/cart" className="relative text-gray-700 hover:text-primary-600">
                  <FiShoppingCart size={24} />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>

                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
                    <FiUser size={24} />
                    <span>{user?.name}</span>
                  </button>

                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block">
                    <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      My Profile
                    </Link>
                    <Link to="/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      My Orders
                    </Link>

                    {user?.role === 'CUSTOMER' && (
                      <Link to="/apply-merchant" className="block px-4 py-2 text-primary-600 hover:bg-gray-100 font-medium">
                        Become a Merchant
                      </Link>
                    )}

                    {user?.role === 'MERCHANT' && (
                      <Link to="/merchant/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                        Merchant Dashboard
                      </Link>
                    )}

                    {user?.role === 'ADMIN' && (
                      <Link to="/admin/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                        Admin Dashboard
                      </Link>
                    )}

                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700"
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

            <Link to="/products" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
              Products
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
                <button onClick={handleLogout} className="block py-2 text-red-600">
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
