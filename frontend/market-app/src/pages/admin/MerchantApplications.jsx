import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { FiCheck, FiX, FiEye, FiClock, FiFileText } from 'react-icons/fi';
import AdminLayout from '../../components/layout/AdminLayout';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MerchantApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedApp, setSelectedApp] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/admin/merchant-applications${filter ? `?status=${filter}` : ''}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setApplications(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (app, type) => {
    setSelectedApp(app);
    setActionType(type);
    setShowModal(true);
    setRejectionReason('');
    setAdminNotes('');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedApp(null);
    setActionType(null);
    setRejectionReason('');
    setAdminNotes('');
  };

  const handleApprove = async () => {
    if (!selectedApp) return;

    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/admin/merchant-applications/${selectedApp.id}/approve`,
        { admin_notes: adminNotes },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success('Application approved successfully!');
        closeModal();
        fetchApplications();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to approve application');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    if (rejectionReason.length < 20) {
      toast.error('Rejection reason must be at least 20 characters');
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/admin/merchant-applications/${selectedApp.id}/reject`,
        {
          rejection_reason: rejectionReason,
          admin_notes: adminNotes
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success('Application rejected');
        closeModal();
        fetchApplications();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to reject application');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      PENDING: 'bg-yellow-600/20 text-yellow-300 border border-yellow-500/30',
      UNDER_REVIEW: 'bg-blue-600/20 text-blue-300 border border-blue-500/30',
      APPROVED: 'bg-green-600/20 text-green-300 border border-green-500/30',
      REJECTED: 'bg-red-600/20 text-red-300 border border-red-500/30'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status] || 'bg-gray-600/20 text-gray-300 border border-gray-500/30'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
        <h1 className="text-4xl font-bold text-white mb-2">Merchant Applications</h1>
        <p className="text-gray-300 text-lg">Review and manage merchant application requests</p>
        <div className="mt-4 h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-8 flex gap-2 p-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl w-fit">
        {['pending', 'under_review', 'approved', 'rejected', ''].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-6 py-3 font-semibold rounded-xl transition-all duration-300 ${
              filter === status
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            {status === '' ? 'All' : status.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-12 text-center">
          <FiFileText className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-400">No applications found</p>
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden rounded-2xl">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Business Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Applied On
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-white">{app.business_name}</div>
                    <div className="text-sm text-gray-400">{app.business_type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{app.user?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-400">{app.user?.email || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {formatDate(app.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(app.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-3">
                      <Link
                        to={`/admin/merchant-applications/${app.id}`}
                        className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                      >
                        <FiEye size={16} />
                        View
                      </Link>
                      {app.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => openModal(app, 'approve')}
                            className="text-green-400 hover:text-green-300 transition-colors flex items-center gap-1"
                          >
                            <FiCheck size={16} />
                            Approve
                          </button>
                          <button
                            onClick={() => openModal(app, 'reject')}
                            className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                          >
                            <FiX size={16} />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Action Modal */}
      {showModal && selectedApp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">
              {actionType === 'approve' ? 'Approve Application' : 'Reject Application'}
            </h2>

            <div className="mb-6">
              <p className="text-gray-300 mb-2">
                <strong className="text-white">Business:</strong> {selectedApp.business_name}
              </p>
              <p className="text-gray-300">
                <strong className="text-white">Applicant:</strong> {selectedApp.user?.name} ({selectedApp.user?.email})
              </p>
            </div>

            {actionType === 'reject' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rejection Reason <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 backdrop-blur-sm"
                  placeholder="Provide a detailed reason for rejection (minimum 20 characters)..."
                  required
                />
                <p className="text-sm text-gray-400 mt-2">
                  {rejectionReason.length}/1000 characters (minimum 20)
                </p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Admin Notes (Optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows="3"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
                placeholder="Internal notes (not visible to applicant)..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                disabled={processing}
                className="flex-1 px-6 py-2 border border-white/20 rounded-lg text-gray-300 hover:bg-white/10 transition-colors backdrop-blur-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={actionType === 'approve' ? handleApprove : handleReject}
                disabled={processing || (actionType === 'reject' && rejectionReason.length < 20)}
                className={`flex-1 px-6 py-2 rounded-lg text-white font-medium transition-all duration-300 disabled:opacity-50 ${
                  actionType === 'approve'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                }`}
              >
                {processing ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default MerchantApplications;
