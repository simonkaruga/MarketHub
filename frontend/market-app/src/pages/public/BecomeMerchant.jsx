import { Link } from 'react-router-dom';
import {
  CheckCircleIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  TruckIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const BecomeMerchant = () => {
  const { isAuthenticated } = useAuth();

  const benefits = [
    {
      icon: UserGroupIcon,
      title: 'Reach More Customers',
      description: 'Access thousands of active buyers across Kenya looking for quality products.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Secure Payments',
      description: 'Get paid directly through M-Pesa with automatic payment processing after order completion.'
    },
    {
      icon: TruckIcon,
      title: 'No Delivery Hassle',
      description: 'Our hub-based system handles pickup logistics. Just prepare and dispatch orders.'
    },
    {
      icon: ChartBarIcon,
      title: 'Powerful Analytics',
      description: 'Track sales, monitor inventory, and understand your customers with detailed dashboards.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Verified Badge',
      description: 'Build trust with customers through our merchant verification system.'
    },
    {
      icon: CheckCircleIcon,
      title: 'Easy Management',
      description: 'Simple tools to list products, manage orders, and handle customer reviews.'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Create an Account',
      description: 'Sign up as a customer first. You\'ll need a valid email and phone number.'
    },
    {
      number: '02',
      title: 'Apply to Sell',
      description: 'Complete the merchant application with your business details and documents.'
    },
    {
      number: '03',
      title: 'Get Verified',
      description: 'Our team reviews your application within 2-3 business days.'
    },
    {
      number: '04',
      title: 'Start Selling',
      description: 'Once approved, list your products and start receiving orders!'
    }
  ];

  const requirements = [
    'Valid National ID or Passport',
    'Business Registration Certificate (for registered businesses)',
    'M-Pesa registered phone number for payments',
    'Clear product images and descriptions',
    'Ability to fulfill orders within 48 hours'
  ];

  const faqs = [
    {
      question: 'How much does it cost to sell on MarketHub?',
      answer: 'Signing up is free! We only charge a 25% commission on completed sales. There are no listing fees or monthly charges.'
    },
    {
      question: 'How do I receive payments?',
      answer: 'Payments are automatically sent to your registered M-Pesa number after the customer picks up their order and the commission is deducted.'
    },
    {
      question: 'How long does approval take?',
      answer: 'Most applications are reviewed within 2-3 business days. You\'ll receive an email notification once your application is processed.'
    },
    {
      question: 'What products can I sell?',
      answer: 'You can sell most legal products including electronics, fashion, home goods, beauty products, and more. Prohibited items include weapons, drugs, counterfeit goods, and illegal items.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-[#0f172a]">
        {/* Hero Section */}
      <div className="bg-[#0f172a] py-20">
        <div className="container-custom">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Sell on MarketHub
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Join Kenya's fastest-growing marketplace and reach thousands of customers.
              Start selling today with zero upfront costs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              {isAuthenticated ? (
                <Link
                  to="/apply-merchant"
                  className="inline-block bg-orange-500 text-white px-8 py-4 rounded-md font-semibold text-lg hover:bg-orange-600 transition-colors"
                >
                  Apply Now
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-block bg-orange-500 text-white px-8 py-4 rounded-md font-semibold text-lg hover:bg-orange-600 transition-colors"
                  >
                    Create Account & Apply
                  </Link>
                  <Link
                    to="/login"
                    className="inline-block bg-slate-700 text-white px-8 py-4 rounded-md font-semibold text-lg hover:bg-slate-600 transition-colors border border-orange-500"
                  >
                    Login to Apply
                  </Link>
                </>
              )}
            </div>

            {/* Seller Guide Link */}
            <div className="text-center">
              <Link
                to="/seller-guide"
                className="inline-flex items-center text-gray-300 hover:text-orange-400 font-medium transition-colors group"
              >
                <BookOpenIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Learn more about selling on MarketHub →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-[#0f172a] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-orange-400">500+</div>
              <div className="text-gray-300">Active Merchants</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-400">25,000+</div>
              <div className="text-gray-300">Monthly Buyers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-400">25%</div>
              <div className="text-gray-300">Commission Only</div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Why Sell on MarketHub?</h2>
            <p className="text-gray-300 mt-2">Everything you need to grow your business</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-slate-800 rounded-lg p-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-700 rounded-full mb-4">
                  <benefit.icon className="h-6 w-6 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-gray-300">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-[#0f172a] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">How to Get Started</h2>
            <p className="text-gray-300 mt-2">Four simple steps to start selling</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 text-white rounded-full text-2xl font-bold mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-300 text-sm">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-slate-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Requirements */}
      <div className="py-16 bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">What You'll Need</h2>
              <p className="text-gray-300 mb-6">
                Before applying, make sure you have the following ready to ensure a smooth
                application process:
              </p>
              <ul className="space-y-4">
                {requirements.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircleIcon className="h-6 w-6 text-orange-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-300">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-800 rounded-lg p-8">
              <h3 className="text-xl font-semibold text-white mb-4">Commission Structure</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-600 pb-4">
                  <span className="text-gray-300">Platform Commission</span>
                  <span className="text-2xl font-bold text-orange-400">25%</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-600 pb-4">
                  <span className="text-gray-300">Listing Fees</span>
                  <span className="text-xl font-bold text-orange-400">FREE</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-600 pb-4">
                  <span className="text-gray-300">Monthly Fees</span>
                  <span className="text-xl font-bold text-orange-400">FREE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Payment Processing</span>
                  <span className="text-xl font-bold text-orange-400">Included</span>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-4">
                * You only pay when you make a sale. No hidden fees.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-[#0f172a] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-slate-800 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                <p className="text-gray-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#0f172a] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Selling?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join hundreds of successful merchants on MarketHub. Apply today and start selling tomorrow!
          </p>
          {isAuthenticated ? (
            <Link
              to="/apply-merchant"
              className="inline-block bg-orange-500 text-white px-10 py-4 rounded-md font-semibold text-lg hover:bg-orange-600 transition-colors"
            >
              Apply Now
            </Link>
          ) : (
            <Link
              to="/register"
              className="inline-block bg-orange-500 text-white px-10 py-4 rounded-md font-semibold text-lg hover:bg-orange-600 transition-colors"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default BecomeMerchant;
