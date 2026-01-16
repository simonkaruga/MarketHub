const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: January 2024</p>

          <div className="prose prose-green max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-600 mb-4">
                MarketHub ("we", "our", or "us") is committed to protecting your privacy. This Privacy
                Policy explains how we collect, use, disclose, and safeguard your information when you
                use our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>

              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Personal Information</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Name and contact details (email, phone number)</li>
                <li>Account credentials</li>
                <li>Payment information (M-Pesa details)</li>
                <li>Pickup hub preferences</li>
                <li>Order history and preferences</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">For Merchants</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Business registration details</li>
                <li>ID/KRA PIN information</li>
                <li>Bank account or M-Pesa details for payments</li>
                <li>Product and inventory information</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Automatically Collected</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Device information (browser type, OS)</li>
                <li>IP address and location data</li>
                <li>Usage patterns and preferences</li>
                <li>Cookies and similar technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-600 mb-4">We use collected information to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Process and fulfill orders</li>
                <li>Verify merchant accounts and prevent fraud</li>
                <li>Send transaction confirmations and updates</li>
                <li>Provide customer support</li>
                <li>Improve our platform and services</li>
                <li>Send promotional communications (with your consent)</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Information Sharing</h2>
              <p className="text-gray-600 mb-4">We may share your information with:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li><strong>Merchants:</strong> Order details necessary for fulfillment</li>
                <li><strong>Payment Processors:</strong> M-Pesa/Safaricom for transaction processing</li>
                <li><strong>Hub Staff:</strong> Pickup information for order collection</li>
                <li><strong>Service Providers:</strong> Third parties who help operate our platform</li>
                <li><strong>Legal Authorities:</strong> When required by law or to protect rights</li>
              </ul>
              <p className="text-gray-600 mt-4">
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
              <p className="text-gray-600 mb-4">
                We implement appropriate security measures to protect your information:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Secure authentication mechanisms</li>
                <li>Regular security audits and updates</li>
                <li>Limited access to personal data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Cookies</h2>
              <p className="text-gray-600 mb-4">
                We use cookies and similar technologies to enhance your experience, remember preferences,
                and analyze usage. You can control cookies through your browser settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
              <p className="text-gray-600 mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data (subject to legal requirements)</li>
                <li>Opt out of marketing communications</li>
                <li>Export your data in a portable format</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Data Retention</h2>
              <p className="text-gray-600 mb-4">
                We retain personal information for as long as necessary to provide services and comply
                with legal obligations. Order history is kept for 7 years for accounting purposes.
                You can request account deletion at any time.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
              <p className="text-gray-600 mb-4">
                MarketHub is not intended for users under 18 years of age. We do not knowingly collect
                information from children. If you believe a child has provided us with personal
                information, please contact us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
              <p className="text-gray-600 mb-4">
                We may update this Privacy Policy periodically. We will notify you of significant
                changes through the platform or email. Continued use after changes indicates acceptance.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
              <p className="text-gray-600">
                For privacy-related inquiries or to exercise your rights, contact us at:
              </p>
              <ul className="text-gray-600 mt-2">
                <li>Email: privacy@markethub.co.ke</li>
                <li>Phone: +254 700 000 000</li>
                <li>Address: Westlands Business Park, Nairobi, Kenya</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
