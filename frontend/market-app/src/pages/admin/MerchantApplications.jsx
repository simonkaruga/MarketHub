import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import toast from 'react-hot-toast';
import axios from 'axios';
import { FiCheck, FiX, FiEye, FiClock, FiFileText } from 'react-icons/fi';

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
      PENDING: 'bg-yellow-100 text-yellow-800',
      UNDER_REVIEW: 'bg-blue-100 text-blue-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
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
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1 container-custom py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Merchant Applications</h1>
          <p className="text-gray-600">Review and manage merchant application requests</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 border-b">
          {['pending', 'under_review', 'approved', 'rejected', ''].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 font-medium ${
                filter === status
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {status === '' ? 'All' : status.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FiFileText className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No applications found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{app.business_name}</div>
                      <div className="text-sm text-gray-500">{app.business_type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{app.user?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{app.user?.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(app.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/merchant-applications/${app.id}`}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                          <FiEye size={16} />
                          View
                        </Link>
                        {app.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => openModal(app, 'approve')}
                              className="text-green-600 hover:text-green-900 flex items-center gap-1"
                            >
                              <FiCheck size={16} />
                              Approve
                            </button>
                            <button
                              onClick={() => openModal(app, 'reject')}
                              className="text-red-600 hover:text-red-900 flex items-center gap-1"
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
      </div>

      {/* Action Modal */}
      {showModal && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              {actionType === 'approve' ? 'Approve Application' : 'Reject Application'}
            </h2>

            <div className="mb-4">
              <p className="text-gray-700">
                <strong>Business:</strong> {selectedApp.business_name}
              </p>
              <p className="text-gray-700">
                <strong>Applicant:</strong> {selectedApp.user?.name} ({selectedApp.user?.email})
              </p>
            </div>

            {actionType === 'reject' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Provide a detailed reason for rejection (minimum 20 characters)..."
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {rejectionReason.length}/1000 characters (minimum 20)
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes (Optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Internal notes (not visible to applicant)..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                disabled={processing}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={actionType === 'approve' ? handleApprove : handleReject}
                disabled={processing || (actionType === 'reject' && rejectionReason.length < 20)}
                className={`flex-1 px-4 py-2 rounded-md text-white font-medium disabled:opacity-50 ${
                  actionType === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {processing ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MerchantApplications;
