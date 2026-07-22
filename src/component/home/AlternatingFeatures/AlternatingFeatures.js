"use client";

import { motion } from "framer-motion";

export default function AlternatingFeatures() {
  // Swapped 'icon' for 'image' with placeholder URLs. 
  // Replace these URLs with your actual local paths (e.g., "/images/feature-1.jpg")
  const features = [
    {
      id: 1,
      title: "Secure Document Vault",
      description:
        "Stop relying on messy email threads. Upload, organize, and access all your tax returns, audit reports, and financial statements in one secure, centralized hub.",
      badge: "Security First",
      image: "/assets/Data_security_24.jpg",
    },
    {
      id: 2,
      title: "Real-Time Compliance Tracking",
      description:
        "Never miss a filing deadline again. Our dashboard gives you a bird's-eye view of your ongoing compliance tasks, upcoming due dates, and pending approvals.",
      badge: "Stay Updated",
      image: "/assets/Jan-Business_report_1.jpg",
    },
    {
      id: 3,
      title: "Seamless Invoice Management",
      description:
        "Review, approve, and track invoices directly through the portal. We've simplified the billing process so you can focus on growing your business.",
      badge: "Billing Simplified",
      image: "/assets/67Z_2112.w012.n001.18A.p20.18.jpg",
    }
  ];

  return (
    <section className="bg-dark/30 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Section Header */}
        <div className="mb-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-dark sm:text-4xl lg:text-5xl">
            Everything you need, <br className="hidden sm:block" />
            <span className="text-taupe-500">nothing you don&apos;t.</span>
          </h2>
        </div>

        {/* The Zig-Zag Grid */}
        <div className="space-y-24 lg:space-y-32">
          {features.map((feature, index) => {
            const isReversed = index % 2 !== 0;

            return (
              <div
                key={feature.id}
                className={`flex flex-col gap-12 lg:items-center lg:gap-16 ${
                  isReversed ? "lg:flex-row-reverse" : "lg:flex-row"
                }`}
              >
                
                {/* Image Side */}
                <motion.div
                  className="w-full lg:w-1/2"
                  initial={{ opacity: 0, x: isReversed ? 50 : -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                >
                  <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-dark/10 shadow-lg">
                    {/* The Actual Image */}
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    {/* Subtle Overlay to ensure it blends well with the premium theme */}
                    <div className="absolute inset-0 bg-dark/5 transition-colors duration-500 group-hover:bg-transparent" />
                  </div>
                </motion.div>

                {/* Text Content Side */}
                <motion.div
                  className="w-full lg:w-1/2"
                  initial={{ opacity: 0, x: isReversed ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                >
                  <div className={`flex flex-col ${isReversed ? "lg:items-end lg:text-right" : "lg:items-start lg:text-left"}`}>
                    <span className="mb-4 inline-flex items-center rounded-full bg-taupe-100 px-4 py-1.5 text-sm font-semibold text-dark">
                      {feature.badge}
                    </span>
                    <h3 className="mb-6 text-3xl font-bold text-dark sm:text-4xl">
                      {feature.title}
                    </h3>
                    <p className="text-lg leading-relaxed text-dark/70">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
                
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}