import { Link, useLocation } from 'react-router-dom';
import {
  FiHome, FiShoppingBag, FiUsers, FiSettings,
  FiPackage, FiStar, FiBarChart2, FiFileText
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
    { path: '/admin/products', icon: FiPackage, label: 'Products' },
    { path: '/admin/orders', icon: FiShoppingBag, label: 'Orders' },
    { path: '/admin/merchants', icon: FiUsers, label: 'Merchants' },
    { path: '/admin/applications', icon: FiFileText, label: 'Applications' },
    { path: '/admin/analytics', icon: FiBarChart2, label: 'Analytics' },
  ];

  const links = user?.role === 'merchant' ? merchantLinks : adminLinks;

  return (
    <aside className="w-64 bg-white shadow-lg h-screen sticky top-0">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800">
          {user?.role === 'merchant' ? 'Merchant' : 'Admin'} Panel
        </h2>
      </div>

      <nav className="mt-6">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors ${
                isActive(link.path) ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-600' : ''
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
