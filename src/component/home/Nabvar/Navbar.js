"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Menu, X, ArrowDown } from "lucide-react";

export default function Navbar(pathname) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showTrigger, setShowTrigger] = useState(false);
  const { data: session, status } = useSession();

  console.log(pathname.path, "pathmane");

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  useEffect(() => {
    let ticking = false;
    const SCROLL_THRESHOLD = 15;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const delta = currentScrollY - lastScrollY;

        if (currentScrollY < 80) {
          setIsVisible(true);
          setShowTrigger(false);
          setLastScrollY(currentScrollY);
          ticking = false;
          return;
        }

        if (Math.abs(delta) > SCROLL_THRESHOLD) {
          if (delta > 0) {
            setIsVisible(false);
            setIsMobileMenuOpen(false);
            setShowTrigger(true);
          } else {
            setIsVisible(true);
            setShowTrigger(false);
          }
          setLastScrollY(currentScrollY);
        }

        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleTriggerClick = () => {
    setIsVisible(true);
    setShowTrigger(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <header
        className={`fixed left-0 top-0 z-50 w-full px-3 pt-4 sm:px-4 sm:pt-6 lg:px-6 transition-all duration-500 ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "-translate-y-24 opacity-0 pointer-events-none"
        }`}
        style={{
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)", // smooth "ease-out-expo" feel
        }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="relative flex items-center justify-between rounded-full border border-dark/10 bg-light/80 px-3 py-3 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl ring-1 ring-white/70 sm:px-4 lg:px-6">
            <Link
              href="/"
              className="relative z-20 shrink-0 font-black tracking-tight text-dark sm:text-2xl"
            >
              <div>
                <h1 className="text-2xl">TechSparch</h1>
                <p className="text-sm font-semibold opacity-80">
                  SAKSHAM SOLUTIONS
                </p>
              </div>
            </Link>

            <div className="absolute inset-x-0 z-10 mx-auto hidden w-max items-center justify-center md:flex">
              <nav className="flex items-center gap-2 rounded-full border border-dark/10 bg-white/70 px-2 py-2 shadow-sm backdrop-blur-md">
                <Link
                  href="/"
                  className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-dark/80 transition-all duration-300 hover:bg-dark/10 hover:text-dark"
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className={`rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-dark/80 transition-all duration-300 hover:bg-dark/10 hover:text-dark ${pathname.path === "/about" ? "underline underline-offset-4" : ""}`}
                >
                  About
                </Link>

                <Link
                  href="/services"
                  className={`rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-dark/80 transition-all duration-300 hover:bg-dark/10 hover:text-dark ${pathname.path === "/services" ? "underline underline-offset-4" : ""}`}
                >
                  Services
                </Link>

                <Link
                  href="/contact"
                  className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-dark/80 transition-all duration-300 hover:bg-dark/10 hover:text-dark"
                >
                  Contact
                </Link>
              </nav>
            </div>

            <div className="relative z-20 hidden items-center space-x-3 md:flex">
              {status === "loading" ? (
                <div className="h-9 w-28 animate-pulse rounded-full bg-dark/10"></div>
              ) : session ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-sm font-semibold uppercase tracking-[0.2em] text-dark/80 transition-colors duration-300 hover:text-dark"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="rounded-full bg-dark px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.2em] text-light transition-all duration-300 hover:-translate-y-0.5 hover:bg-dark/90"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => signIn()}
                  className="rounded-full bg-dark px-5 py-2.5 text-sm font-semibold tracking-[0.2em] text-light transition-all duration-300 hover:-translate-y-0.5 hover:bg-dark/90"
                >
                  LogIn
                </button>
              )}
            </div>

            <div className="relative z-20 flex items-center md:hidden">
              <button
                onClick={toggleMenu}
                className="rounded-full border border-dark/10 bg-white/80 p-2 text-dark shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-105"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="absolute left-0 top-full mt-3 w-full px-3 md:hidden">
            <div className="rounded-[28px] border border-dark/10 bg-light/95 px-4 py-4 shadow-[0_20px_50px_rgba(15,23,42,0.16)] backdrop-blur-xl">
              <div className="flex flex-col items-center space-y-2">
                <Link
                  href="/"
                  onClick={toggleMenu}
                  className="block w-full rounded-full px-4 py-2 text-center text-sm font-semibold uppercase tracking-[0.15em] text-dark/80 transition-all duration-300 hover:bg-dark/10 hover:text-dark"
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  onClick={toggleMenu}
                  className="block w-full rounded-full px-4 py-2 text-center text-sm font-semibold uppercase tracking-[0.15em] text-dark/80 transition-all duration-300 hover:bg-dark/10 hover:text-dark"
                >
                  About
                </Link>
                <Link
                  href="/services"
                  onClick={toggleMenu}
                  className="block w-full rounded-full px-4 py-2 text-center text-sm font-semibold uppercase tracking-[0.15em] text-dark/80 transition-all duration-300 hover:bg-dark/10 hover:text-dark"
                >
                  Services
                </Link>
                <Link
                  href="/contact"
                  onClick={toggleMenu}
                  className="block w-full rounded-full px-4 py-2 text-center text-sm font-semibold uppercase tracking-[0.15em] text-dark/80 transition-all duration-300 hover:bg-dark/10 hover:text-dark"
                >
                  Contact
                </Link>

                <div className="my-3 h-px w-full bg-gradient-to-r from-transparent via-dark/20 to-transparent"></div>

                {session ? (
                  <div className="flex w-full flex-col items-center space-y-3">
                    <Link
                      href="/dashboard"
                      onClick={toggleMenu}
                      className="w-full rounded-full px-4 py-2 text-center text-sm font-semibold uppercase tracking-[0.25em] text-dark/80 transition-all duration-300 hover:bg-dark/10 hover:text-dark"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full max-w-xs rounded-full bg-dark px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-light"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      toggleMenu();
                      signIn();
                    }}
                    className="w-full max-w-xs rounded-full bg-dark px-6 py-3 text-sm font-semibold tracking-[0.2em] text-light"
                  >
                    LogIn
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Floating "show nav" button — fixed bottom-right, simple toggle */}
      <button
        onClick={handleTriggerClick}
        aria-label="Show navigation"
        className={`fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-dark text-light shadow-[0_10px_30px_rgba(15,23,42,0.35)] transition-opacity duration-200 ${
          showTrigger ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <ArrowDown size={22} />
      </button>
    </>
  );
}
