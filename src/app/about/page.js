"use client";
import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/component/home/Nabvar/Navbar";
import { usePathname } from "next/navigation";
import {
  Lightbulb,
  TriangleAlert,
  Rocket,
  Target,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

export default function AboutPage() {
  const pathname = usePathname();

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Update coordinates when mouse moves over the main container
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <>
      <Navbar path={pathname} />

      <div className="absolute inset-0 z-0 h-full w-full bg-[linear-gradient(to_right,rgba(9,60,93,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(9,60,93,0.08)_1px,transparent_1px)] bg-[size:48px_48px]">
        {/* Radial fade mask for base grid (softens the edges) */}
        <div className="absolute inset-0 bg-light [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,transparent_30%,black_100%)]"></div>
      </div>

      {/* 2. Interactive Hover Grid (Bold & Dark) */}
      <div
        className="absolute inset-0 z-0 h-full w-full bg-[linear-gradient(to_right,rgba(9,60,93,0.6)_2px,transparent_2px),linear-gradient(to_bottom,rgba(9,60,93,0.6)_2px,transparent_2px)] bg-[size:48px_48px] transition-opacity duration-300"
        style={{
          opacity: isHovering ? 0.3 : 0,
          // Creates a 150px "flashlight" reveal effect tied to the mouse coordinates
          WebkitMaskImage: `radial-gradient(150px circle at ${mousePosition.x}px ${mousePosition.y}px, black, transparent)`,
          maskImage: `radial-gradient(150px circle at ${mousePosition.x}px ${mousePosition.y}px, black, transparent)`,
        }}
      ></div>

      <main
        className="min-h-screen bg-light dark:bg-dark text-dark dark:text-light"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* 1. Hero */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 max-w-5xl mx-auto text-center overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-120 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(37,99,235,0.12),transparent)]"
          />

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-balance">
            Building a digital future with{" "}
            <span className="text-taupe-400 tracking-wide underline underline-offset-4">
              paperless
            </span>{" "}
            workflows
          </h1>

          <p className="text-lg md:text-xl text-dark/70 dark:text-light/70 max-w-3xl mx-auto tracking-tight">
            We believe accounting should be simple, secure, and completely
            paperless. Our mission is to empower Chartered Accountants with
            modern technology that streamlines document management, invoicing,
            and client collaboration—all from one unified platform.
          </p>
        </section>

        <section className="py-24 px-6 border-y border-dark/10 bg-dark/70">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12 max-w-2xl">
              <p className="text-sm uppercase tracking-[0.2em] text-taupe-300 mb-3">
                Our Story
              </p>

              <h2 className="text-4xl font-bold text-light">
                Built to simplify the way CA firms work.
              </h2>

              <p className="mt-4 text-light">
                Every feature we build is driven by one goal—helping Chartered
                Accountants save time, reduce paperwork, and deliver a better
                client experience.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-light bg-light/75 p-7">
                <Lightbulb className="h-8 w-8 text-dark mb-5" />

                <h3 className="text-xl font-semibold text-dark mb-3">
                  Why We Started
                </h3>

                <p className="text-dark leading-relaxed">
                  We believe Chartered Accountants should spend their time
                  advising clients—not managing paperwork.
                </p>
              </div>

              <div className="rounded-2xl border border-light bg-light/75 p-7">
                <TriangleAlert className="h-8 w-8 text-dark mb-5" />

                <h3 className="text-xl font-semibold text-dark mb-3">
                  The Challenge
                </h3>

                <p className="text-dark leading-relaxed">
                  Disconnected documents, manual follow-ups, and scattered
                  workflows slowed down productivity and client service.
                </p>
              </div>

              <div className="rounded-2xl border border-light/10 bg-light/5 p-7 transition-all hover:border-taupe-400/40 hover:bg-light/10">
                <Rocket className="h-8 w-8 text-taupe-400 mb-5" />

                <h3 className="text-xl font-semibold text-light mb-3">
                  Our Solution
                </h3>

                <p className="text-light/70 leading-relaxed">
                  A secure digital platform that unifies document management,
                  invoicing, payments, and client collaboration.
                </p>
              </div>

              <div className="rounded-2xl border border-light/10 bg-light/5 p-7 transition-all hover:border-taupe-400/40 hover:bg-light/10">
                <Target className="h-8 w-8 text-taupe-400 mb-5" />

                <h3 className="text-xl font-semibold text-light mb-3">
                  Our Mission
                </h3>

                <p className="text-light/70 leading-relaxed">
                  Empower CA firms to work faster, stay organized, and embrace a
                  secure, paperless future.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Core Values */}
        <section className="py-24 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400 mb-3">
              What sets us apart
            </span>
            <h2 className="text-3xl font-bold">How we do things differently</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Value 1 */}
            <div className="group p-8 rounded-2xl border border-dark/10 dark:border-light/10 bg-light dark:bg-dark hover:border-blue-600/30 dark:hover:border-blue-400/30 hover:shadow-xl hover:shadow-blue-600/5 transition-all duration-200">
              <div className="w-11 h-11 bg-blue-50 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-6 text-lg font-bold group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-400 dark:group-hover:text-dark transition-colors">
                01
              </div>
              <h3 className="text-xl font-bold mb-3">Security first</h3>
              <p className="text-dark/70 dark:text-light/70 leading-relaxed">
                Your clients trust you with their most sensitive financial data.
                We honor that trust with a role-based document vault that keeps
                data visible only to authorized people.
              </p>
            </div>

            {/* Value 2 */}
            <div className="group p-8 rounded-2xl border border-dark/10 dark:border-light/10 bg-light dark:bg-dark hover:border-blue-600/30 dark:hover:border-blue-400/30 hover:shadow-xl hover:shadow-blue-600/5 transition-all duration-200">
              <div className="w-11 h-11 bg-blue-50 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-6 text-lg font-bold group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-400 dark:group-hover:text-dark transition-colors">
                02
              </div>
              <h3 className="text-xl font-bold mb-3">
                Frictionless automation
              </h3>
              <p className="text-dark/70 dark:text-light/70 leading-relaxed">
                Technology should handle the heavy lifting. We automate
                repetitive tasks — document categorization, payment reminders —
                so you can focus on advisory work.
              </p>
            </div>

            {/* Value 3 */}
            <div className="group p-8 rounded-2xl border border-dark/10 dark:border-light/10 bg-light dark:bg-dark hover:border-blue-600/30 dark:hover:border-blue-400/30 hover:shadow-xl hover:shadow-blue-600/5 transition-all duration-200">
              <div className="w-11 h-11 bg-blue-50 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-6 text-lg font-bold group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-400 dark:group-hover:text-dark transition-colors">
                03
              </div>
              <h3 className="text-xl font-bold mb-3">Radical transparency</h3>
              <p className="text-dark/70 dark:text-light/70 leading-relaxed">
                No more miscommunication. Real-time dashboards and dedicated
                client portals keep firm and client on the same page about
                documents and payment history.
              </p>
            </div>
          </div>
        </section>

        {/* 4. The People */}
        <section className="py-30 px-6 bg-dark/80 text-light dark:bg-light dark:text-dark">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.18em] text-blue-400 dark:text-blue-600 mb-4">
              Our team
            </span>
            <h2 className="text-3xl font-bold mb-6">
              Built by experts, for experts
            </h2>
            <p className="text-lg text-light/70 dark:text-dark/70 max-w-2xl mx-auto leading-relaxed">
              Our team brings together deep technical expertise in building
              fast, reliable cloud architecture with a profound understanding of
              the unique bottlenecks faced by the accounting industry.
            </p>
          </div>
        </section>

        {/* 5. CTA */}
        <section className="py-28 px-6 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">
            Ready to make your firm completely digital?
          </h2>
          <p className="text-lg text-dark/70 dark:text-light/70 mb-10">
            Join the CA firms that are saving time, reducing operational costs,
            and improving their client experience.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/demo"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors duration-200 text-lg"
            >
              Book a demo
            </Link>
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-dark/20 dark:border-light/20 hover:border-dark/40 dark:hover:border-light/40 text-dark dark:text-light font-semibold rounded-xl transition-colors duration-200 text-lg"
            >
              Start free trial
            </Link>
          </div>
        </section>

        <footer className="bg-white border-t border-dark/10 pt-16 pb-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
              {/* Brand Info */}
              <div className="lg:col-span-1">
                <span className="text-2xl font-black text-dark tracking-tighter">
                  SAKSHAM <span className="text-taupe-500">SOLUTIONS</span>
                </span>
                <p className="mt-4 text-sm leading-relaxed text-dark/60">
                  Modernizing financial compliance with a secure, client-first
                  portal designed for ease of use.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-dark">
                  Platform
                </h4>
                <ul className="space-y-3 text-sm text-dark/70">
                  <li>
                    <a
                      href="#"
                      className="hover:text-taupe-600 transition-colors"
                    >
                      Features
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-taupe-600 transition-colors"
                    >
                      How it Works
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-taupe-600 transition-colors"
                    >
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-taupe-600 transition-colors"
                    >
                      Security
                    </a>
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-dark">
                  Support
                </h4>
                <ul className="space-y-3 text-sm text-dark/70">
                  <li>
                    <a
                      href="#"
                      className="hover:text-taupe-600 transition-colors"
                    >
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-taupe-600 transition-colors"
                    >
                      Client Guides
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-taupe-600 transition-colors"
                    >
                      Terms of Service
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-taupe-600 transition-colors"
                    >
                      Privacy Policy
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-dark">
                  Contact Us
                </h4>
                <ul className="space-y-4 text-sm text-dark/70">
                  <li className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-taupe-500" />
                    support@techsparch.com
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-taupe-500" />
                    +91 (800) 123-4567
                  </li>
                  <li className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-taupe-500 mt-0.5" />
                    <span>
                      123 Financial District,
                      <br />
                      Mumbai, Maharashtra
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-16 border-t border-dark/10 pt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-dark/50">
                © {new Date().getFullYear()} Saksham Solutions. All rights
                reserved.
              </p>
            </div>

            <p className="text-sm text-dark/50 flex items-center gap-1">
              Designed & Developed in 🇮🇳 India with{" "}
              <span className="text-red-500">❤️</span>.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
