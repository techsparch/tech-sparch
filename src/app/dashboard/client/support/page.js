import React from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const SupportPage = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Support & Contact
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Need assistance? Reach out to our team using any of the methods below.
        </p>
      </div>

      {/* Contact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Email Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-8 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mb-5">
            <Mail className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Email Us</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            Drop us an email anytime. Our support team typically responds within 24 hours.
          </p>
          <a href="mailto:techsparch.ss@gmail.com" className="text-blue-600 font-medium hover:underline text-lg">
            techsparch.ss@gmail.com

          </a>
        </div>

        {/* Phone Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-8 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-5">
            <Phone className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Call Us</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            Speak directly with our support team during normal business hours.
          </p>
          <a href="tel:+18001234567" className="text-green-600 font-medium hover:underline text-lg">
            +1 (800) 123-4567
          </a>
        </div>

        {/* Hours Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-8 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-full flex items-center justify-center mb-5">
            <Clock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Business Hours</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Monday - Friday<br />
            <span className="font-medium text-gray-700 dark:text-gray-300">9:00 AM - 6:00 PM (EST)</span>
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Saturday - Sunday<br />
            <span className="font-medium text-gray-700 dark:text-gray-300">Closed</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;