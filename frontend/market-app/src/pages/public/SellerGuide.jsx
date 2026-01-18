import { Link } from 'react-router-dom';
import {
  CheckCircleIcon,
  BookOpenIcon,
  ShoppingBagIcon,
  TruckIcon,
  CreditCardIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const SellerGuide = () => {
  const guideSections = [
    {
      icon: ShoppingBagIcon,
      title: 'Listing Your Products',
      content: [
        'Create detailed product listings with high-quality images',
        'Write clear, descriptive titles and descriptions',
        'Set competitive pricing and stock levels',
        'Choose appropriate categories for better visibility',
        'Add product variations (sizes, colors, etc.)'
      ]
    },
    {
      icon: TruckIcon,
      title: 'Order Fulfillment',
      content: [
        'Prepare orders within 48 hours of purchase',
        'Package items securely for transport',
        'Label packages clearly with order information',
        'Deliver to your nearest MarketHub hub',
        'Track order status through your dashboard'
      ]
    },
    {
      icon: CreditCardIcon,
      title: 'Payment & Commission',
      content: [
        'Receive payments via M-Pesa after order completion',
        '25% commission deducted automatically',
        'No hidden fees or monthly charges',
        'Payments processed within 24 hours of pickup',
        'Track earnings through detailed reports'
      ]
    },
    {
      icon: UserGroupIcon,
      title: 'Customer Service',
      content: [
        'Respond to customer inquiries within 24 hours',
        'Handle returns and refunds professionally',
        'Maintain high ratings through good service',
        'Use the platform messaging system',
        'Address reviews and feedback promptly'
      ]
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics & Growth',
      content: [
        'Monitor sales performance and trends',
        'Track product popularity and inventory',
        'Analyze customer demographics',
        'Optimize listings based on data',
        'Use insights to grow your business'
      ]
    },
    {
      icon: ShieldCheckIcon,
      title: 'Best Practices',
      content: [
        'Maintain accurate inventory levels',
        'Update product information regularly',
        'Follow platform policies and guidelines',
        'Keep your account information current',
        'Participate in promotional activities'
      ]
    }
  ];

  const tips = [
    {
      category: 'Product Photography',
      items: [
        'Use natural lighting for clear photos',
        'Show products from multiple angles',
        'Include size references (coins, hands, etc.)',
        'Use plain backgrounds to highlight products',
        'Edit photos for consistent brightness'
      ]
    },
    {
      category: 'Pricing Strategy',
      items: [
        'Research competitor pricing',
        'Factor in MarketHub commission (25%)',
        'Consider shipping costs in pricing',
        'Offer competitive rates for quick sales',
        'Adjust prices based on demand'
      ]
    },
    {
      category: 'Customer Communication',
      items: [
        'Be responsive to inquiries',
        'Set clear expectations for delivery',
        'Provide accurate product information',
        'Handle complaints professionally',
        'Thank customers for their business'
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Link
                to="/become-merchant"
                className="inline-flex items-center text-primary-100 hover:text-white mb-4 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Become a Merchant
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Seller Guide
              </h1>
              <p className="text-xl text-primary-100 max-w-3xl mx-auto">
                Everything you need to know to succeed as a MarketHub merchant.
                Learn best practices, tips, and strategies for growing your business.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-wrap gap-4 justify-center">
              {guideSections.map((section, index) => (
                <a
                  key={index}
                  href={`#section-${index}`}
                  className="inline-flex items-center px-4 py-2 bg-primary-50 text-primary-700 rounded-full hover:bg-primary-100 transition-colors"
                >
                  <section.icon className="h-4 w-4 mr-2" />
                  {section.title}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {guideSections.map((section, index) => (
              <div key={index} id={`section-${index}`} className="bg-white rounded-xl shadow-sm p-8">
                <div className="flex items-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mr-4">
                    <section.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                </div>
                <ul className="space-y-4">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Pro Tips for Success</h2>
              <p className="text-gray-600 mt-2">Expert advice to help you excel on MarketHub</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {tips.map((tipCategory, index) => (
                <div key={index} className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-primary-800 mb-4">{tipCategory.category}</h3>
                  <ul className="space-y-3">
                    {tipCategory.items.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start">
                        <div className="w-2 h-2 bg-primary-600 rounded-full mr-3 mt-2 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Additional Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <BookOpenIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Merchant FAQ</h3>
                <p className="text-gray-600 mb-4">Find answers to common questions about selling on MarketHub.</p>
                <Link to="/faq" className="text-primary-600 hover:text-primary-700 font-medium">
                  Read FAQ →
                </Link>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <UserGroupIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Support</h3>
                <p className="text-gray-600 mb-4">Need help? Our support team is here to assist you.</p>
                <Link to="/contact" className="text-primary-600 hover:text-primary-700 font-medium">
                  Get Support →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-primary-600 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Selling?</h2>
            <p className="text-primary-100 mb-8">
              Apply now and join hundreds of successful merchants on MarketHub.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/become-merchant"
                className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                Become a Merchant
              </Link>
              <Link
                to="/register"
                className="inline-block bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-800 transition-colors border border-primary-500"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SellerGuide;
