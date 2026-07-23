"use client";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Mail,
  MapPin,
  Phone,
  PhoneCall,
} from "lucide-react";
import Navbar from "@/component/home/Nabvar/Navbar";
import { usePathname } from "next/navigation";
import {
  FileText,
  Users,
  CreditCard,
  LayoutDashboard,
  Cloud,
  KeyRound,
  Activity,
  FileClock,
  BarChart3,
  Bell,
  ShieldCheck,
  UserCog,
  CloudLightning,
  ScrollText,
} from "lucide-react";
import { useState } from "react";

const checklist = [
  "Encrypted communication across every channel",
  "Secure authentication for every login",
  "Privacy-first architecture from the ground up",
  "Customer-owned data, always",
  "Protected access to every document",
];

const services = [
  {
    icon: FileText,
    title: "Secure Document Management",
    description:
      "Store, organize, and share client documents in one encrypted workspace built for accounting workflows.",
  },
  {
    icon: Users,
    title: "Client Portal",
    description:
      "Give clients a dedicated space to upload files, track requests, and stay updated without endless email threads.",
  },
  {
    icon: CreditCard,
    title: "Subscription & Billing",
    description:
      "Automate recurring invoices, collect payments, and keep your firm's cash flow predictable.",
  },
  {
    icon: LayoutDashboard,
    title: "Practice Dashboard",
    description:
      "See every client, deadline, and pending task across your firm from a single, unified screen.",
  },
  {
    icon: Cloud,
    title: "Cloud Storage",
    description:
      "Access client records from anywhere with encrypted, always-available cloud infrastructure.",
  },
  {
    icon: KeyRound,
    title: "Role-Based Access",
    description:
      "Control exactly who on your team can view, edit, or approve each client's records.",
  },
];

const features = [
  { icon: Users, label: "Client Overview" },
  { icon: Activity, label: "Recent Activity" },
  { icon: CreditCard, label: "Payment Tracking" },
  { icon: FileClock, label: "Pending Documents" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Bell, label: "Notifications" },
];

const items = [
  {
    icon: ShieldCheck,
    title: "End-to-End Protection",
    description:
      "Every file and message is encrypted in transit and at rest, keeping client data private end to end.",
  },
  {
    icon: UserCog,
    title: "Role-Based Permissions",
    description:
      "Assign granular access levels so staff only see the client data relevant to their role.",
  },
  {
    icon: CloudLightning,
    title: "Secure Cloud Storage",
    description:
      "Documents live on encrypted, redundant infrastructure built to meet firm compliance needs.",
  },
  {
    icon: ScrollText,
    title: "Audit Logs",
    description:
      "Every action is time-stamped and recorded, giving your firm a full trail for compliance reviews.",
  },
];

const faqs = [
  {
    question: "Is my data secure?",
    answer:
      "Yes. All documents and messages are encrypted in transit and at rest, and access is protected by secure authentication and role-based permissions.",
  },
  {
    question: "Can clients upload documents?",
    answer:
      "Clients get their own portal where they can upload files directly, so your team isn't chasing attachments over email.",
  },
  {
    question: "Can multiple staff members use one account?",
    answer:
      "Yes. Your firm's account supports multiple staff logins, each with role-based access tailored to what they need to see.",
  },
  {
    question: "Does the platform support recurring billing?",
    answer:
      "Yes. You can set up automated recurring invoices and let Saksham Solutions handle collection and payment tracking.",
  },
  {
    question: "Can I manage multiple clients?",
    answer:
      "Your practice dashboard is built to handle your entire client base, with a clear overview of every client's status in one place.",
  },
  {
    question: "How are documents protected?",
    answer:
      "Documents are stored on encrypted cloud infrastructure, access is scoped by role, and every action is logged for a full audit trail.",
  },
];

export default function ServicesPage() {
  const pathname = usePathname();
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <>
      <Navbar path={pathname} />
      <main className="bg-dark">
        {/* Dashboard Overview */}
        <section className="relative overflow-hidden border-y border-dark/10 bg-light px-6 py-44 min-h-screen md:h-screen">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-light [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_30%,black_100%)]"
          />

          <div className="relative mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-2">
            {/* Dashboard mockup placeholder */}
            <div className="order-2 md:order-1">
              <div className="rounded-2xl border border-dark/10 bg-dark/5 p-4 shadow-2xl shadow-black/10">
                <div className="mb-4 flex items-center gap-1.5 px-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-dark/20 animate-pulse" />
                  <span className="h-2.5 w-2.5 rounded-full bg-dark/20 animate-pulse [animation-delay:150ms]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-dark/20 animate-pulse [animation-delay:300ms]" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 h-40 rounded-xl bg-dark/10 animate-pulse" />
                  <div className="h-40 rounded-xl bg-dark/10 animate-pulse [animation-delay:100ms]" />
                  <div className="h-24 rounded-xl bg-dark/10 animate-pulse [animation-delay:200ms]" />
                  <div className="h-24 rounded-xl bg-dark/10 animate-pulse [animation-delay:300ms]" />
                  <div className="h-24 rounded-xl bg-dark/10 animate-pulse [animation-delay:400ms]" />
                </div>
              </div>
            </div>
            {/* Feature copy */}
            <div className="order-1 md:order-2">
              <p className="mb-3 text-sm uppercase tracking-[0.2em] text-taupe-400">
                Dashboard Overview
              </p>
              <h2 className="text-4xl font-bold leading-tight text-dark">
                Manage Your Entire Practice from One Dashboard
              </h2>
              <p className="mt-4 text-dark/70">
                Every client, deadline, and payment status in view, so nothing
                slips through the cracks.
              </p>

              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {features.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex items-center gap-3 rounded-xl border border-dark/10 bg-dark/5 px-4 py-3.5 transition-all duration-300 hover:border-taupe-400/40 hover:bg-dark/10"
                  >
                    <Icon className="h-5 w-5 shrink-0 text-taupe-400" />
                    <span className="text-sm font-medium text-dark">
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Our Services */}
        <section className="bg-dark px-6 py-36">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 max-w-2xl">
              <p className="mb-3 text-sm uppercase tracking-[0.2em] text-taupe-400">
                Our Services
              </p>
              <h2 className="text-4xl font-bold text-light">
                One platform, every part of practice management.
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {services.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-light/10 bg-light/5 p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-taupe-400/40 hover:bg-light/10"
                >
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-taupe-400/10">
                    <Icon className="h-6 w-6 text-taupe-400" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-light">
                    {title}
                  </h3>
                  <p className="leading-relaxed text-light/70">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="relative overflow-hidden bg-light px-6 py-24">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-taupe-400/10 blur-[120px]"
          />

          <div className="relative mx-auto max-w-6xl">
            <div className="mb-12 max-w-2xl">
              <p className="mb-3 text-sm uppercase tracking-[0.2em] text-dark">
                Security
              </p>
              <h2 className="text-4xl font-bold text-dark">
                Enterprise-Grade Security
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {items.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="group relative rounded-2xl border border-dark/10 bg-dark p-6 transition-all duration-300 hover:border-taupe-400/40"
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 shadow-[0_0_32px_rgba(194,168,120,0.25)] transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <div className="relative mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-light">
                    <Icon className="h-5 w-5 text-dark" />
                  </div>
                  <h3 className="relative mb-2 text-lg font-semibold text-light">
                    {title}
                  </h3>
                  <p className="relative text-sm leading-relaxed text-light/60">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Privacy & Compliance */}
        <section className="bg-light px-6 py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-2">
            <div>
              <p className="mb-3 text-sm uppercase tracking-[0.2em] text-taupe-400">
                Privacy & Compliance
              </p>
              <h2 className="text-4xl font-bold leading-tight text-dark">
                Your Data. <span className="text-taupe-400">Your Control.</span>
              </h2>
              <p className="mt-4 leading-relaxed text-dark/70">
                Saksham Solutions is built around a privacy-first architecture.
                Every message and document is encrypted in transit, every login
                is protected by secure authentication, and your firm's data
                remains yours, never sold, shared, or mined for anything beyond
                running your practice. Document access is scoped and logged, so
                you always know who touched what, and when.
              </p>
            </div>

            <ul className="space-y-3">
              {checklist.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-xl border border-dark/10 bg-dark/5 px-5 py-4 transition-all duration-300 hover:border-taupe-400/40 hover:bg-dark/10"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-taupe-400" />
                  <span className="text-dark/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-dark px-6 py-24">
          <div className="mx-auto max-w-3xl">
            <div className="mb-12 max-w-2xl">
              <p className="mb-3 text-sm uppercase tracking-[0.2em] text-taupe-400">
                FAQ
              </p>
              <h2 className="text-4xl font-bold text-light">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="divide-y divide-light/10 rounded-2xl border border-light/10 bg-light/5">
              {faqs.map(({ question, answer }, index) => {
                const isOpen = openIndex === index;
                return (
                  <div key={question}>
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors duration-300 hover:bg-light/5"
                    >
                      <span className="font-medium text-light">{question}</span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-taupe-400 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        isOpen
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-6 pb-5 leading-relaxed text-light/70">
                          {answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

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
    </>
  );
}
