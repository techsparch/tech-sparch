import { ArrowRight, Mail, Phone, MapPin } from "lucide-react";

export default function CTAAndFooter() {
  return (
    <>
      {/* CTA Section */}
      <section className="bg-dark/70 px-4 py-24 sm:px-6 lg:px-8 border-t-2 rounded-t-[67vh] ">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-light/80  px-6 py-20 text-center shadow-2xl relative sm:px-12 lg:px-16">
          {/* Subtle Background Elements */}
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-taupe-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-light/5 blur-3xl" />

          <div className="relative z-10">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-dark sm:text-4xl lg:text-5xl">
              Ready to simplify your Docs and other Amazing things ?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-dark">
              Join TechSparch today and experience a modern, stress-free
              approach to managing your financial compliance.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button className="group flex w-full items-center justify-center gap-2 rounded-full bg-taupe-100 px-8 py-4 text-base font-bold text-dark transition-all duration-300 hover:bg-white hover:shadow-xl sm:w-auto">
                Create Free Account
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <button className="flex w-full items-center justify-center rounded-full border border-light/20 bg-transparent px-8 py-4 text-base font-bold text-dark transition-all duration-300 hover:bg-light/10 sm:w-auto">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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
        </div>
      </footer>
    </>
  );
}
