import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiMail, FiPhone } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">MarketHub</h3>
            <p className="text-gray-300 text-sm">
              Kenya's premier online marketplace. Buy and sell with confidence.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <FiFacebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <FiTwitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <FiInstagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-white">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* For Sellers */}
          <div>
            <h4 className="font-semibold mb-4">For Sellers</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/become-merchant" className="text-gray-300 hover:text-white">
                  Become a Merchant
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-white">
                  Merchant Login
                </Link>
              </li>
              <li>
                <Link to="/seller-guide" className="text-gray-300 hover:text-white">
                  Seller Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center text-gray-300">
                <FiMail className="mr-2" size={16} />
                support@markethub.co.ke
              </li>
              <li className="flex items-center text-gray-300">
                <FiPhone className="mr-2" size={16} />
                +254 700 000 000
              </li>
              <li className="text-gray-300">
                Nairobi, Kenya
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-300">
          <p>&copy; {new Date().getFullYear()} MarketHub. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link to="/terms" className="hover:text-white">Terms of Service</Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
