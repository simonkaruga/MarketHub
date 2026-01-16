const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-500 mb-8">Last updated: January 2024</p>

          <div className="prose prose-green max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 mb-4">
                By accessing and using MarketHub, you agree to be bound by these Terms of Service. If you
                do not agree to these terms, please do not use our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. User Accounts</h2>
              <p className="text-gray-600 mb-4">
                To use certain features of MarketHub, you must register for an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Be responsible for all activities under your account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Buying on MarketHub</h2>
              <p className="text-gray-600 mb-4">As a buyer, you agree to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Pay for items you purchase in full</li>
                <li>Pick up orders within the specified timeframe (5 days)</li>
                <li>Provide accurate delivery/pickup information</li>
                <li>Not engage in fraudulent transactions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Selling on MarketHub</h2>
              <p className="text-gray-600 mb-4">As a merchant, you agree to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Provide accurate product descriptions and images</li>
                <li>Maintain adequate inventory for listed products</li>
                <li>Fulfill orders within the specified timeframe</li>
                <li>Pay the platform commission (25%) on completed sales</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not sell prohibited or counterfeit items</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Payments</h2>
              <p className="text-gray-600 mb-4">
                MarketHub processes payments through M-Pesa and accepts Cash on Pickup. All transactions
                are final once completed. Refunds are processed according to our refund policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Prohibited Activities</h2>
              <p className="text-gray-600 mb-4">Users are prohibited from:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Violating any laws or regulations</li>
                <li>Posting false or misleading information</li>
                <li>Engaging in fraudulent activities</li>
                <li>Harassing other users</li>
                <li>Attempting to circumvent platform fees</li>
                <li>Using the platform for money laundering</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
              <p className="text-gray-600 mb-4">
                All content on MarketHub, including logos, designs, and software, is owned by MarketHub
                or its licensors. Users retain ownership of content they submit but grant MarketHub a
                license to use such content for platform operations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-600 mb-4">
                MarketHub is a marketplace platform and is not responsible for the quality, safety, or
                legality of items listed. We do not guarantee that the platform will be error-free or
                uninterrupted. Our liability is limited to the amount of fees paid to us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Dispute Resolution</h2>
              <p className="text-gray-600 mb-4">
                Any disputes between buyers and merchants should first be resolved through our support
                team. If a resolution cannot be reached, disputes will be handled according to Kenyan law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Termination</h2>
              <p className="text-gray-600 mb-4">
                We reserve the right to suspend or terminate accounts that violate these terms. Users may
                close their accounts at any time by contacting support.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
              <p className="text-gray-600 mb-4">
                We may update these terms from time to time. Continued use of the platform after changes
                constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
              <p className="text-gray-600">
                For questions about these Terms of Service, please contact us at:
              </p>
              <ul className="text-gray-600 mt-2">
                <li>Email: legal@markethub.co.ke</li>
                <li>Phone: +254 700 000 000</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
