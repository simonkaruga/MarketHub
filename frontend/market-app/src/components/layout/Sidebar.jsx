import { Link, useLocation } from 'react-router-dom';
import {
  FiHome, FiShoppingBag, FiUsers, FiSettings,
  FiPackage, FiStar, FiBarChart2, FiFileText, FiArrowLeft
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => location.pathname.startsWith(path);

  const merchantLinks = [
    { path: '/merchant/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/merchant/products', icon: FiPackage, label: 'Products' },
    { path: '/merchant/orders', icon: FiShoppingBag, label: 'Orders' },
    { path: '/merchant/reviews', icon: FiStar, label: 'Reviews' },
    { path: '/merchant/analytics', icon: FiBarChart2, label: 'Analytics' },
  ];

  const adminLinks = [
    { path: '/admin/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/admin/users', icon: FiUsers, label: 'Users' },
    { path: '/admin/merchant-applications', icon: FiFileText, label: 'Applications' },
    { path: '/admin/orders', icon: FiShoppingBag, label: 'Orders' },
    { path: '/admin/analytics', icon: FiBarChart2, label: 'Analytics' },
    { path: '/admin/hub-staff', icon: FiSettings, label: 'Hub Staff' },
  ];

  const links = user?.role === 'merchant' ? merchantLinks : adminLinks;

  return (
    <aside className="w-64 bg-black/20 backdrop-blur-md border-r border-white/10 h-screen sticky top-0">
      <div className="p-6">
        <h2 className="text-xl font-bold text-white">
          {user?.role === 'merchant' ? 'Merchant' : 'Admin'} Panel
        </h2>
      </div>

      <nav className="mt-6">
        <Link
          to="/"
          className="flex items-center px-6 py-3 text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200"
        >
          <FiArrowLeft size={20} className="mr-3" />
          <span>Back to App</span>
        </Link>

        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center px-6 py-3 text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200 ${
                isActive(link.path) ? 'bg-white/20 text-white border-r-4 border-blue-400' : ''
              }`}
            >
              <Icon size={20} className="mr-3" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
