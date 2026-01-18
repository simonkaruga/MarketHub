import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: 'General',
      questions: [
        {
          question: 'What is MarketHub?',
          answer: 'MarketHub is Kenya\'s premier online marketplace that connects buyers with verified merchants. We offer a wide range of products from electronics to fashion, all with secure payment options and reliable delivery.'
        },
        {
          question: 'How do I create an account?',
          answer: 'Click on the "Register" button at the top right of the page. Fill in your details including name, email, phone number, and password. You can also sign up using your Google account for faster registration.'
        },
        {
          question: 'Is my personal information secure?',
          answer: 'Yes, we take security seriously. All personal data is encrypted and stored securely. We never share your information with third parties without your consent.'
        }
      ]
    },
    {
      category: 'Shopping',
      questions: [
        {
          question: 'How do I place an order?',
          answer: 'Browse products, add items to your cart, and proceed to checkout. Select your preferred pickup hub, choose a payment method (M-Pesa or Cash on Pickup), and confirm your order.'
        },
        {
          question: 'What payment methods are accepted?',
          answer: 'We accept M-Pesa payments and Cash on Pickup. M-Pesa payments are processed instantly using the Daraja API for secure transactions.'
        },
        {
          question: 'Can I cancel my order?',
          answer: 'You can cancel your order if it hasn\'t been processed yet. Go to "My Orders" and click the cancel button. Once an order is being prepared or shipped, cancellation may not be possible.'
        },
        {
          question: 'How do I track my order?',
          answer: 'Log in to your account and go to "My Orders". You can view the status of each order including processing, ready for pickup, and completed stages.'
        }
      ]
    },
    {
      category: 'Pickup & Delivery',
      questions: [
        {
          question: 'How does the pickup hub system work?',
          answer: 'When you place an order, you select a nearby pickup hub. Once your order is ready, you\'ll receive a notification. Visit the hub with your order ID and collect your items.'
        },
        {
          question: 'How long do I have to pick up my order?',
          answer: 'Orders are held at pickup hubs for 5 days. After this period, uncollected orders may be returned to the merchant.'
        },
        {
          question: 'Can I change my pickup hub after ordering?',
          answer: 'You can request a hub change by contacting customer support before your order is dispatched. Changes cannot be made once the order is in transit.'
        }
      ]
    },
    {
      category: 'Selling on MarketHub',
      questions: [
        {
          question: 'How do I become a merchant?',
          answer: 'Create a customer account first, then apply to become a merchant through the "Become a Merchant" page. Provide your business details, upload required documents, and wait for admin approval.'
        },
        {
          question: 'What documents do I need to become a merchant?',
          answer: 'You\'ll need a valid ID or business registration certificate, M-Pesa statement or bank details for payments, and clear photos of your products.'
        },
        {
          question: 'How do I receive payments as a merchant?',
          answer: 'Merchant payments are processed after successful order completion. Funds are transferred to your registered M-Pesa number or bank account after deducting the platform commission.'
        },
        {
          question: 'What is the commission rate?',
          answer: 'MarketHub charges a 25% commission on each sale. This covers platform maintenance, payment processing, and customer support services.'
        }
      ]
    },
    {
      category: 'Returns & Refunds',
      questions: [
        {
          question: 'What is the return policy?',
          answer: 'Products can be returned within 7 days of pickup if they are defective, damaged, or not as described. Items must be in original condition with all tags attached.'
        },
        {
          question: 'How do I request a refund?',
          answer: 'Contact customer support through the Contact page or email support@markethub.co.ke with your order details and reason for refund. Refunds are processed within 5-7 business days.'
        },
        {
          question: 'When will I receive my refund?',
          answer: 'M-Pesa refunds are processed within 24-48 hours after approval. The amount will be sent to the phone number used during payment.'
        }
      ]
    }
  ];

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Find answers to common questions about shopping, selling, and using MarketHub.
          </p>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* FAQ Categories */}
          <div className="space-y-6">
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
                  <h2 className="text-lg font-semibold text-white">{category.category}</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {category.questions.map((item, questionIndex) => {
                    const key = `${categoryIndex}-${questionIndex}`;
                    const isOpen = openIndex === key;
                    return (
                      <div key={questionIndex} className="px-6">
                        <button
                          onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                          className="w-full py-4 flex justify-between items-center text-left focus:outline-none group"
                        >
                          <span className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{item.question}</span>
                          {isOpen ? (
                            <ChevronUpIcon className="h-5 w-5 text-primary-600 flex-shrink-0" />
                          ) : (
                            <ChevronDownIcon className="h-5 w-5 text-gray-400 group-hover:text-primary-600 flex-shrink-0 transition-colors" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="pb-4 pr-12 animate-fadeIn">
                            <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 bg-primary-50 rounded-xl p-8 text-center border border-primary-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Still have questions?</h3>
            <p className="text-gray-600 mb-6">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <Link
              to="/contact"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FAQ;
