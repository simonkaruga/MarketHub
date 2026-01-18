import { Link } from 'react-router-dom';
import {
  ShieldCheckIcon,
  TruckIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const About = () => {
  const stats = [
    { label: 'Active Merchants', value: '500+' },
    { label: 'Products Listed', value: '10,000+' },
    { label: 'Happy Customers', value: '25,000+' },
    { label: 'Pickup Hubs', value: '50+' }
  ];

  const values = [
    {
      icon: ShieldCheckIcon,
      title: 'Trust & Security',
      description: 'We verify all merchants and ensure secure transactions through M-Pesa integration.'
    },
    {
      icon: TruckIcon,
      title: 'Convenient Pickup',
      description: 'Our hub-based pickup system lets you collect orders at your convenience, near you.'
    },
    {
      icon: UserGroupIcon,
      title: 'Community First',
      description: 'We empower local businesses and create economic opportunities across Kenya.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Fair Pricing',
      description: 'Competitive prices from verified merchants with transparent pricing, no hidden fees.'
    }
  ];

  const team = [
    {
      name: 'RONNY MBOYA',
      role: 'CEO & Founder',
      image: '/mboya.jpg'
    },
    {
      name: 'SIMON KARUGA',
      role: 'Head of Operations',
      image: '/simon.jpeg'
    },
    {
      name: 'KELVIN JOHNSON',
      role: 'Tech Lead',
      image: '/kev1.jpg'
    },
    {
      name: 'SHEILA AWUOR',
      role: 'Merchant Relations',
      image: '/shee.jpeg'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-[#0f172a]">
        {/* Hero Section */}
        <div className="bg-[#0f172a] py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">About MarketHub</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Kenya's premier online marketplace connecting buyers with trusted local merchants.
              We're building the future of e-commerce in East Africa.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-[#0f172a] py-12 border-b border-slate-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-orange-400">{stat.value}</div>
                  <div className="text-gray-300 mt-1 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Our Story Section */}
        <div className="py-16 bg-[#0f172a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">Our Story</h2>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    MarketHub was born from a simple idea: make online shopping accessible, secure, and convenient
                    for every Kenyan. Founded in 2023, we set out to solve the challenges of e-commerce in Kenya -
                    trust issues, delivery complications, and payment security.
                  </p>
                  <p>
                    Our innovative hub-based pickup system eliminates the uncertainty of home deliveries. Instead
                    of waiting at home for packages, customers can pick up their orders at nearby collection points
                    at their convenience.
                  </p>
                  <p>
                    We partner with local merchants - from small businesses to established retailers - giving them
                    a platform to reach customers across Kenya. By verifying every merchant and product, we ensure
                    our customers shop with confidence.
                  </p>
                  <p>
                    Today, MarketHub serves thousands of customers and hundreds of merchants across Kenya, and we're
                    just getting started. Our mission is to become East Africa's most trusted online marketplace.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="bg-slate-800 rounded-2xl p-8 border border-slate-600">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-700 rounded-xl p-6 shadow-sm border border-slate-500 hover:shadow-md transition-shadow">
                      <BuildingStorefrontIcon className="h-10 w-10 text-orange-400 mb-3" />
                      <h3 className="font-semibold text-white">Local Merchants</h3>
                      <p className="text-sm text-gray-300 mt-1">Supporting Kenyan businesses</p>
                    </div>
                    <div className="bg-slate-700 rounded-xl p-6 shadow-sm border border-slate-500 hover:shadow-md transition-shadow">
                      <GlobeAltIcon className="h-10 w-10 text-orange-400 mb-3" />
                      <h3 className="font-semibold text-white">Nationwide</h3>
                      <p className="text-sm text-gray-300 mt-1">Serving all 47 counties</p>
                    </div>
                    <div className="bg-slate-700 rounded-xl p-6 shadow-sm border border-slate-500 col-span-2 hover:shadow-md transition-shadow">
                      <div className="text-center">
                        <span className="text-4xl font-bold text-orange-400">2023</span>
                        <p className="text-gray-300 mt-1">Founded in Nairobi, Kenya</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-[#0f172a] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white">Our Values</h2>
              <p className="text-gray-300 mt-2">What drives us every day</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div key={index} className="bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-600 text-center hover:shadow-md transition-shadow">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-700 rounded-full mb-4">
                    <value.icon className="h-7 w-7 text-orange-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="py-16 bg-[#0f172a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white">Our Team</h2>
              <p className="text-gray-300 mt-2">The people behind MarketHub</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <div key={index} className="text-center group">
                  <div className="relative mb-4 inline-block">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-32 h-32 rounded-full mx-auto object-cover ring-4 ring-slate-600 group-hover:ring-slate-500 transition-all"
                    />
                  </div>
                  <h3 className="font-semibold text-white">{member.name}</h3>
                  <p className="text-orange-400 text-sm font-medium">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-[#0f172a] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Join MarketHub?</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Whether you're looking to shop or sell, we're here to help you succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="inline-block bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors shadow-sm hover:shadow-md"
              >
                Start Shopping
              </Link>
              <Link
                to="/become-merchant"
                className="inline-block bg-slate-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-slate-600 transition-colors border border-orange-500 shadow-sm hover:shadow-md"
              >
                Become a Merchant
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;
