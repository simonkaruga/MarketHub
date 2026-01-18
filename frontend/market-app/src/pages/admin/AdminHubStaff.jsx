import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiUser } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminHubStaff = () => {
  const [staff, setStaff] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    password: '',
    hub_id: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStaff();
    fetchHubs();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/hub-staff');

      if (response.data.success) {
        setStaff(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load hub staff');
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHubs = async () => {
    try {
      const response = await api.get('/admin/hubs');

      if (response.data.success) {
        setHubs(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching hubs:', error);
    }
  };

  const handleOpenModal = (staffMember = null) => {
    if (staffMember) {
      setEditingStaff(staffMember);
      setFormData({
        name: staffMember.name,
        email: staffMember.email,
        phone_number: staffMember.phone_number,
        password: '',
        hub_id: staffMember.hub_id || ''
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: '',
        email: '',
        phone_number: '',
        password: '',
        hub_id: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStaff(null);
    setFormData({
      name: '',
      email: '',
      phone_number: '',
      password: '',
      hub_id: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone_number) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!editingStaff && !formData.password) {
      toast.error('Password is required for new staff');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingStaff
        ? `/admin/hub-staff/${editingStaff.id}`
        : `/admin/hub-staff`;

      const method = editingStaff ? 'put' : 'post';

      const payload = {
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone_number,
        hub_id: formData.hub_id ? parseInt(formData.hub_id) : null
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      await api[method](url, payload);

      toast.success(editingStaff ? 'Staff updated successfully' : 'Staff member created successfully');
      handleCloseModal();
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save staff member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (staffId) => {
    if (!confirm('Are you sure you want to delete this staff member?')) {
      return;
    }

    try {
      await api.delete(`/admin/hub-staff/${staffId}`);
      toast.success('Staff member deleted successfully');
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete staff member');
    }
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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Hub Staff Management</h1>
          <p className="text-gray-300 text-lg">Manage hub staff accounts and assignments</p>
          <div className="mt-4 h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
        >
          <FiPlus />
          Add Staff Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600">
                <FiUser className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-300 truncate">Total Staff</dt>
                <dd className="text-2xl font-bold text-white">{staff.length}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600">
                <FiUser className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-300 truncate">Assigned</dt>
                <dd className="text-2xl font-bold text-white">
                  {staff.filter(s => s.hub_id).length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600">
                <FiUser className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-300 truncate">Unassigned</dt>
                <dd className="text-2xl font-bold text-white">
                  {staff.filter(s => !s.hub_id).length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Assigned Hub
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {staff.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                    No staff members found. Click "Add Staff Member" to create one.
                  </td>
                </tr>
              ) : (
                staff.map((member) => (
                  <tr key={member.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {member.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {member.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {member.phone_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {member.hub_name || (
                        <span className="text-yellow-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.is_active
                          ? 'bg-green-600/20 text-green-300 border border-green-500/30'
                          : 'bg-red-600/20 text-red-300 border border-red-500/30'
                      }`}>
                        {member.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(member)}
                        className="text-blue-400 hover:text-blue-300 transition-colors mr-4"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-white transition-colors text-2xl">
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  placeholder="0712345678"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password {!editingStaff && '*'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingStaff ? 'Leave blank to keep current' : 'Enter password'}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
                  required={!editingStaff}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Assign to Hub
                </label>
                <select
                  value={formData.hub_id}
                  onChange={(e) => setFormData({ ...formData, hub_id: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
                >
                  <option value="">Unassigned</option>
                  {hubs.map((hub) => (
                    <option key={hub.id} value={hub.id}>
                      {hub.name} - {hub.location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-2 border border-white/20 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 transition-colors backdrop-blur-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingStaff ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminHubStaff;
