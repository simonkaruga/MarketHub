import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import toast from 'react-hot-toast';
import api from '../../services/api';

const ApplyMerchant = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    business_type: '',
    business_registration_number: '',
    tax_identification_number: '',
    business_phone: '',
    business_email: '',
    business_address: '',
    business_city: '',
    bank_name: '',
    bank_account_number: '',
    bank_account_name: '',
    years_in_business: '',
    product_categories: '',
    expected_monthly_sales: '',
    application_notes: ''
  });
  const [documents, setDocuments] = useState({
    business_license: null,
    tax_certificate: null,
    id_document: null
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      // Validate file size (max 5MB)
      if (files[0].size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setDocuments({
        ...documents,
        [name]: files[0]
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('You must be logged in to apply');
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();

      // Add text fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          // Convert product_categories to array
          if (key === 'product_categories') {
            const categories = formData[key].split(',').map(cat => cat.trim());
            formDataToSend.append(key, JSON.stringify(categories));
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      });

      // Add files
      Object.keys(documents).forEach(key => {
        if (documents[key]) {
          formDataToSend.append(key, documents[key]);
        }
      });

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/merchant-applications`,
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        toast.success('Application submitted successfully! We will review your application and get back to you soon.');
        navigate('/profile');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container-custom py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold mb-2">Apply to Become a Merchant</h1>
            <p className="text-gray-600 mb-8">
              Fill out the form below to apply to sell your products on MarketHub.
              We'll review your application and get back to you within 2-3 business days.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Information */}
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold mb-4">Business Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="business_name"
                      required
                      value={formData.business_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Your Business Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="business_type"
                      required
                      value={formData.business_type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select type</option>
                      <option value="Sole Proprietorship">Sole Proprietorship</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Limited Company">Limited Company</option>
                      <option value="Cooperative">Cooperative</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Registration Number
                    </label>
                    <input
                      type="text"
                      name="business_registration_number"
                      value={formData.business_registration_number}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., BN/12345"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax Identification Number (KRA PIN)
                    </label>
                    <input
                      type="text"
                      name="tax_identification_number"
                      value={formData.tax_identification_number}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="A123456789Z"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years in Business <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="years_in_business"
                      required
                      min="0"
                      value={formData.years_in_business}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Monthly Sales
                    </label>
                    <select
                      name="expected_monthly_sales"
                      value={formData.expected_monthly_sales}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select range</option>
                      <option value="Less than KES 50,000">Less than KES 50,000</option>
                      <option value="KES 50,000 - 100,000">KES 50,000 - 100,000</option>
                      <option value="KES 100,000 - 500,000">KES 100,000 - 500,000</option>
                      <option value="KES 500,000 - 1,000,000">KES 500,000 - 1,000,000</option>
                      <option value="Over KES 1,000,000">Over KES 1,000,000</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="business_phone"
                      required
                      value={formData.business_phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="0712345678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="business_email"
                      required
                      value={formData.business_email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="business@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="business_city"
                      required
                      value={formData.business_city}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Nairobi"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="business_address"
                      required
                      value={formData.business_address}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Full business address"
                    />
                  </div>
                </div>
              </div>

              {/* Banking Information */}
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold mb-4">Banking Information</h2>
                <p className="text-sm text-gray-600 mb-4">
                  This information will be used for payment processing
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="bank_name"
                      required
                      value={formData.bank_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Equity Bank"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="bank_account_number"
                      required
                      value={formData.bank_account_number}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="1234567890"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="bank_account_name"
                      required
                      value={formData.bank_account_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Account holder name"
                    />
                  </div>
                </div>
              </div>

              {/* Product Information */}
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold mb-4">Product Information</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Categories <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="product_categories"
                    required
                    value={formData.product_categories}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Electronics, Clothing, Books (comma-separated)"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter the categories of products you plan to sell, separated by commas
                  </p>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    name="application_notes"
                    value={formData.application_notes}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Tell us more about your business and why you want to sell on MarketHub..."
                  />
                </div>
              </div>

              {/* Documents */}
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold mb-4">Supporting Documents</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Upload supporting documents (optional but recommended). Max file size: 5MB
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business License/Certificate
                    </label>
                    <input
                      type="file"
                      name="business_license"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {documents.business_license && (
                      <p className="text-sm text-green-600 mt-1">
                        ✓ {documents.business_license.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax Certificate/KRA PIN Certificate
                    </label>
                    <input
                      type="file"
                      name="tax_certificate"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {documents.tax_certificate && (
                      <p className="text-sm text-green-600 mt-1">
                        ✓ {documents.tax_certificate.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      National ID/Passport
                    </label>
                    <input
                      type="file"
                      name="id_document"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {documents.id_document && (
                      <p className="text-sm text-green-600 mt-1">
                        ✓ {documents.id_document.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary-600 text-white py-3 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ApplyMerchant;
