import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { FiArrowLeft, FiCheck, FiX, FiDownload } from 'react-icons/fi';

const MerchantApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/merchant-applications/${id}`);

      if (response.data.success) {
        setApplication(response.data.data);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load application');
      navigate('/admin/merchant-applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      const response = await api.post(`/admin/merchant-applications/${id}/approve`, { admin_notes: adminNotes });

      if (response.data.success) {
        toast.success('Application approved successfully!');
        navigate('/admin/merchant-applications');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to approve application');
    } finally {
      setProcessing(false);
      setShowApproveModal(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim() || rejectionReason.length < 20) {
      toast.error('Rejection reason must be at least 20 characters');
      return;
    }

    setProcessing(true);
    try {
      const response = await api.post(`/admin/merchant-applications/${id}/reject`, {
        rejection_reason: rejectionReason,
        admin_notes: adminNotes
      });

      if (response.data.success) {
        toast.success('Application rejected');
        navigate('/admin/merchant-applications');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to reject application');
    } finally {
      setProcessing(false);
      setShowRejectModal(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!application) {
    return null;
  }

  return (
    <AdminLayout>
      <button
        onClick={() => navigate('/admin/merchant-applications')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <FiArrowLeft /> Back to Applications
      </button>

      <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{application.business_name}</h1>
              <p className="text-gray-600">{application.business_type}</p>
            </div>
            <div className="text-right">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  application.status === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-800'
                    : application.status === 'APPROVED'
                    ? 'bg-green-100 text-green-800'
                    : application.status === 'REJECTED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {application.status}
              </span>
              <p className="text-sm text-gray-500 mt-2">
                Applied: {new Date(application.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Applicant Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Applicant Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{application.user?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{application.user?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{application.user?.phone_number || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Business Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Business Phone</p>
                <p className="font-medium">{application.business_phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Business Email</p>
                <p className="font-medium">{application.business_email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Registration Number</p>
                <p className="font-medium">{application.business_registration_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tax ID</p>
                <p className="font-medium">{application.tax_identification_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Years in Business</p>
                <p className="font-medium">{application.years_in_business || 0} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Expected Monthly Sales</p>
                <p className="font-medium">{application.expected_monthly_sales || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">City</p>
                <p className="font-medium">{application.business_city}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium">{application.business_address}</p>
              </div>
            </div>
          </div>

          {/* Banking Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Banking Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Bank Name</p>
                <p className="font-medium">{application.bank_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Number</p>
                <p className="font-medium">{application.bank_account_number}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Account Name</p>
                <p className="font-medium">{application.bank_account_name}</p>
              </div>
            </div>
          </div>

          {/* Product Categories */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Product Categories</h2>
            <div className="flex flex-wrap gap-2">
              {application.product_categories?.map((cat, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Application Notes */}
          {application.application_notes && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Application Notes</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{application.application_notes}</p>
            </div>
          )}

          {/* Actions */}
          {application.status === 'PENDING' && (
            <div className="flex gap-4 pt-6 border-t">
              <button
                onClick={() => setShowRejectModal(true)}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium flex items-center justify-center gap-2"
              >
                <FiX size={20} />
                Reject Application
              </button>
              <button
                onClick={() => setShowApproveModal(true)}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium flex items-center justify-center gap-2"
              >
                <FiCheck size={20} />
                Approve Application
              </button>
            </div>
          )}

          {application.rejection_reason && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="font-semibold text-red-900 mb-2">Rejection Reason</h3>
              <p className="text-red-800">{application.rejection_reason}</p>
            </div>
          )}
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">Approve Application</h2>
            <p className="text-gray-700 mb-4">
              Are you sure you want to approve this merchant application? The user will be granted merchant privileges.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes (Optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Internal notes..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowApproveModal(false)}
                disabled={processing}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">Reject Application</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Provide a detailed reason (minimum 20 characters)..."
              />
              <p className="text-sm text-gray-500 mt-1">{rejectionReason.length}/1000 characters</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes (Optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Internal notes..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={processing}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processing || rejectionReason.length < 20}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default MerchantApplicationDetail;
