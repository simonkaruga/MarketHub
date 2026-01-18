import { useState, useEffect } from 'react';
import { FiSearch, FiEdit, FiTrash2, FiKey, FiUserCheck, FiUserX } from 'react-icons/fi';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/formatters';
import AdminLayout from '../../components/layout/AdminLayout';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone_number: '',
    role: '',
    is_active: true,
    email_verified: false
  });

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, statusFilter, currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        search: searchTerm,
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { active: statusFilter })
      });

      const response = await adminService.getUsers(params.toString());
      setUsers(response.users);
      setTotalPages(response.pagination.pages);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      phone_number: user.phone_number || '',
      role: user.role,
      is_active: user.is_active,
      email_verified: user.email_verified
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateUser(selectedUser.id, editForm);
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleResetPassword = async (userId) => {
    const newPassword = prompt('Enter new password for user:');
    if (!newPassword || newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    try {
      await adminService.resetUserPassword(userId, newPassword);
      alert('Password reset successfully');
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Failed to reset password');
    }
  };

  const handleToggleStatus = async (user) => {
    const action = user.is_active ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    try {
      await adminService.updateUser(user.id, { is_active: !user.is_active });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmMessage = `WARNING: This will permanently delete ${user.name} (${user.email}) from the database.\n\nThis action CANNOT be undone!\n\nAre you absolutely sure?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    // Double confirmation for destructive action
    const doubleConfirm = prompt(`Type "DELETE" to confirm permanent deletion of user: ${user.email}`);
    if (doubleConfirm !== 'DELETE') {
      alert('Deletion cancelled. You must type "DELETE" to confirm.');
      return;
    }

    try {
      await adminService.deleteUser(user.id, true); // hard delete
      alert(`User ${user.name} has been permanently deleted.`);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      const errorMessage = error.response?.data?.error?.message || 'Failed to delete user. They may have related data.';
      alert(errorMessage);
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { color: 'bg-red-600/20 text-red-300 border border-red-500/30', text: 'Admin' },
      merchant: { color: 'bg-blue-600/20 text-blue-300 border border-blue-500/30', text: 'Merchant' },
      hub_staff: { color: 'bg-green-600/20 text-green-300 border border-green-500/30', text: 'Hub Staff' },
      customer: { color: 'bg-gray-600/20 text-gray-300 border border-gray-500/30', text: 'Customer' }
    };

    const config = roleConfig[role] || { color: 'bg-gray-600/20 text-gray-300 border border-gray-500/30', text: role };
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">User Management</h1>
        <p className="text-gray-300 text-lg">Manage all users on the platform</p>
        <div className="mt-4 h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="merchant">Merchant</option>
            <option value="hub_staff">Hub Staff</option>
            <option value="customer">Customer</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{user.name}</div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.is_active ? 'bg-green-600/20 text-green-300 border border-green-500/30' : 'bg-red-600/20 text-red-300 border border-red-500/30'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Edit User"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handleResetPassword(user.id)}
                          className="text-yellow-400 hover:text-yellow-300 transition-colors"
                          title="Reset Password"
                        >
                          <FiKey />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={user.is_active ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}
                          title={user.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {user.is_active ? <FiUserX /> : <FiUserCheck />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-400 hover:text-red-300 font-bold transition-colors"
                          title="Permanently Delete User"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 flex items-center justify-between sm:px-6 mt-4 rounded-2xl shadow-2xl">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-white/20 text-sm font-medium rounded-lg text-gray-300 bg-white/5 hover:bg-white/10 disabled:opacity-50 backdrop-blur-sm"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-white/20 text-sm font-medium rounded-lg text-gray-300 bg-white/5 hover:bg-white/10 disabled:opacity-50 backdrop-blur-sm"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-300">
                Page <span className="font-medium text-white">{currentPage}</span> of{' '}
                <span className="font-medium text-white">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-white/20 bg-white/5 text-sm font-medium text-gray-300 hover:bg-white/10 disabled:opacity-50 backdrop-blur-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-white/20 bg-white/5 text-sm font-medium text-gray-300 hover:bg-white/10 disabled:opacity-50 backdrop-blur-sm"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Edit User</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                <input
                  type="text"
                  value={editForm.phone_number}
                  onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
                >
                  <option value="customer">Customer</option>
                  <option value="merchant">Merchant</option>
                  <option value="hub_staff">Hub Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={editForm.is_active}
                  onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                  className="h-5 w-5 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label className="text-sm text-gray-300">
                  Active
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={editForm.email_verified}
                  onChange={(e) => setEditForm({ ...editForm, email_verified: e.target.checked })}
                  className="h-5 w-5 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label className="text-sm text-gray-300">
                  Email Verified
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2 border border-white/20 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 transition-colors backdrop-blur-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
