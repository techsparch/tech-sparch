"use client";

import React from "react";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PricingSection() {
  const features = [
    "Unlimited Document Vault",
    "Dedicated CA Assigned",
    "Monthly GST Filing Access",
    "Annual ITR Filing Support",
    "24/7 Priority Email & Chat Support",
  ];

  return (
    <div className="min-h-screen bg-dark/70 py-20 px-4 sm:px-6 lg:px-8 text-light flex flex-col justify-center">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Everything you need, for one simple price.
          </h1>
          <p className="text-lg text-light/60 font-medium">
            Get full access to all our professional CA services and document
            management tools without breaking the bank. Cancel your Razorpay
            subscription anytime.
          </p>
        </div>

        {/* Single Pricing Card */}
        <div className="max-w-md mx-auto relative flex flex-col p-8 md:p-10 rounded-3xl bg-light border border-blue-500 shadow-2xl shadow-blue-900/20 transform transition-all duration-300 hover:-translate-y-2">
          {/* Highlight Badge */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <span className="bg-light text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full flex items-center gap-1 shadow-lg shadow-blue-900/50">
              <Zap className="h-3 w-3 fill-white" /> Full Access
            </span>
          </div>

          <div className="mb-6 text-center mt-2">
            <h3 className="text-2xl font-bold text-white mb-2">Monthly Plan</h3>
            <p className="text-sm font-semibold text-slate-400">
              Perfect for businesses of all sizes.
            </p>
          </div>

          {/* Pricing Display */}
          <div className="mb-8 flex items-baseline justify-center text-white border-b border-slate-800 pb-8">
            <span className="text-6xl font-bold tracking-tight">₹10</span>
            <span className="text-base font-semibold text-slate-500 ml-2">
              /month
            </span>
          </div>

          {/* Features List */}
          <ul className="space-y-4 mb-8 flex-1">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-3">
                <Check
                  className="h-5 w-5 text-blue-500 shrink-0"
                  strokeWidth={3}
                />
                <span className="text-sm font-semibold text-slate-300">
                  {feature}
                </span>
              </li>
            ))}
          </ul>

          {/* Call to Action */}
          <Button className="w-full h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-900/50 transition-all">
            Subscribe Now
          </Button>

          <p className="text-center text-xs font-semibold text-slate-500 mt-4">
            Secured automatically via Razorpay.
          </p>
        </div>
      </div>
    </div>
  );
}
