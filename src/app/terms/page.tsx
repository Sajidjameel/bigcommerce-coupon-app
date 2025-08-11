// app/terms/page.tsx
import React from "react";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-12">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Terms of Service
        </h1>
        <p className="text-gray-600 mb-4">
          These Terms of Service ("Terms") govern your use of our application
          and related services (collectively, the "Service"). By accessing or
          using the Service, you agree to these Terms.
        </p>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            1. Use of the Service
          </h2>
          <p className="text-gray-600">
            You may use the Service only in compliance with these Terms and all
            applicable laws. You agree not to misuse the Service or help
            anyone else do so.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            2. Accounts
          </h2>
          <p className="text-gray-600">
            You are responsible for maintaining the confidentiality of your
            account credentials and for all activities that occur under your
            account.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            3. Intellectual Property
          </h2>
          <p className="text-gray-600">
            All intellectual property rights in the Service are owned by us or
            our licensors. You may not copy, modify, distribute, sell, or lease
            any part of the Service without our prior written consent.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            4. Termination
          </h2>
          <p className="text-gray-600">
            We may suspend or terminate your access to the Service at any time,
            with or without notice, if we believe you have violated these Terms
            or engaged in fraudulent or unlawful activities.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            5. Limitation of Liability
          </h2>
          <p className="text-gray-600">
            To the fullest extent permitted by law, we shall not be liable for
            any indirect, incidental, special, consequential, or punitive
            damages arising from your use of the Service.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            6. Changes to These Terms
          </h2>
          <p className="text-gray-600">
            We may update these Terms from time to time. The updated version
            will be posted on this page, and your continued use of the Service
            after changes have been posted constitutes your acceptance of the
            new Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            7. Contact Us
          </h2>
          <p className="text-gray-600">
            If you have questions about these Terms, please contact us at{" "}
            <a
              href="mailto:support@example.com"
              className="text-blue-600 underline hover:text-blue-800"
            >
              support@example.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
