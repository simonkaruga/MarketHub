import { useAuth } from '../../hooks/useAuth';
import Sidebar from './Sidebar';

const AdminLayout = ({ children }) => {
  const { user } = useAuth();

  if (!user || user.role !== 'admin') {
    return <div>Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
