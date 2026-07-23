"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Loader2, Send } from "lucide-react";

// ─────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────

// Change this number to update where every "Send Message" submission is routed.
// Format: country code + number, no "+", no spaces, no dashes.
const WHATSAPP_NUMBER = "+919309833172";

const TEAM_SIZE_OPTIONS = [
  "Just me",
  "2–10 Employees",
  "11–25 Employees",
  "26–50 Employees",
  "51–100 Employees",
  "100+ Employees",
];

const EMPTY_FORM = {
  fullName: "",
  email: "",
  mobile: "",
  company: "",
  teamSize: "",
  subject: "",
  message: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_PATTERN = /^[0-9+\s-]{7,15}$/;

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function validate(data) {
  const errors = {};

  if (!data.fullName.trim()) {
    errors.fullName = "Please enter your full name.";
  }

  if (!data.email.trim()) {
    errors.email = "Please enter your email address.";
  } else if (!EMAIL_PATTERN.test(data.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!data.mobile.trim()) {
    errors.mobile = "Please enter your mobile number.";
  } else if (!MOBILE_PATTERN.test(data.mobile.trim())) {
    errors.mobile = "Please enter a valid mobile number.";
  }

  if (!data.message.trim()) {
    errors.message = "Please tell us a little about your enquiry.";
  }

  return errors;
}

function buildWhatsAppMessage(data) {
  const lines = [
    "Hello techSparch Saksham Solutions,",
    "",
    "I would like to enquire about your platform.",
    "",
    "Name:",
    data.fullName,
    "",
    "Email:",
    data.email,
    "",
    "Mobile:",
    data.mobile,
  ];

  if (data.company.trim()) {
    lines.push("", "Company:", data.company);
  }

  if (data.teamSize.trim()) {
    lines.push("", "Team Size:", data.teamSize);
  }

  if (data.subject.trim()) {
    lines.push("", "Subject:", data.subject);
  }

  lines.push("", "Message:", data.message);

  return lines.join("\n");
}

function buildWhatsAppUrl(data) {
  const message = buildWhatsAppMessage(data);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// ─────────────────────────────────────────────
// Small reusable pieces (kept in this file for a single-file drop-in)
// ─────────────────────────────────────────────

function InfoCard({ icon: Icon, title, children }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-light/10 bg-dark p-6">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-taupe-400/10">
        <Icon className="h-5 w-5 text-taupe-400" />
      </div>
      <div>
        <h3 className="mb-1 text-base font-semibold text-light">{title}</h3>
        <div className="text-sm leading-relaxed text-light/60">{children}</div>
      </div>
    </div>
  );
}

function FieldWrapper({ label, htmlFor, required, error, children }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-sm font-medium text-light/80"
      >
        {label} {required && <span className="text-taupe-400">*</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

const baseInputClasses =
  "w-full rounded-xl border bg-dark/40 px-4 py-3 text-sm text-light placeholder:text-light/30 outline-none transition-all duration-300 focus:border-taupe-400/60 focus:bg-dark/60 focus:ring-4 focus:ring-taupe-400/10";

function inputClasses(hasError) {
  return `${baseInputClasses} ${
    hasError ? "border-red-400/50" : "border-light/10"
  }`;
}

// ─────────────────────────────────────────────
// Left column — contact info
// ─────────────────────────────────────────────

function ContactInfo() {
  return (
    <div>
      <p className="mb-3 text-sm uppercase tracking-[0.2em] text-dark">
        Contact Us
      </p>
      <h1 className="text-4xl font-bold leading-tight text-dark md:text-5xl">
        Let&apos;s Talk About Your Firm
      </h1>
      <p className="mt-5 max-w-md leading-relaxed text-dark/70">
        Whether you&apos;re looking to digitize your CA practice, simplify
        client management, or have questions about Saksham Solutions, we&apos;re
        here to help.
      </p>

      <div className="mt-10 flex flex-col gap-4">
        <InfoCard icon={Phone} title="Call Us">
          Business Hours
          <br />
          Monday – Friday
          <br />
          9:00 AM – 6:00 PM
        </InfoCard>

        <InfoCard icon={Mail} title="Email">
          <a
            href="mailto:support@techsparch.com"
            className="text-taupe-400 transition-colors duration-300 hover:text-taupe-300"
          >
            support@techsparch.com
          </a>
          <br />
          We&apos;ll respond within one business day.
        </InfoCard>

        <InfoCard icon={MapPin} title="Location">
          Solapur, Maharashtra
          <br />
          India
        </InfoCard>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Right column — the form
// ─────────────────────────────────────────────

function ContactForm() {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    // Small delay so the loading state is visible before the redirect fires.
    setTimeout(() => {
      const url = buildWhatsAppUrl(formData);
      window.location.href = url;
      setIsSubmitting(false);
    }, 500);
  }

  return (
    <div className="rounded-3xl border border-light/10 bg-dark p-7 shadow-2xl shadow-black/20 md:p-9">
      <h2 className="text-2xl font-semibold text-light">Send us a message</h2>
      <p className="mt-2 text-sm text-light/60">
        Fill out the form and we&apos;ll open a WhatsApp chat with your details,
        ready to send.
      </p>

      <form noValidate onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <FieldWrapper
            label="Full Name"
            htmlFor="fullName"
            required
            error={errors.fullName}
          >
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              placeholder="John Doe"
              className={inputClasses(!!errors.fullName)}
              aria-invalid={!!errors.fullName}
            />
          </FieldWrapper>

          <FieldWrapper
            label="Email Address"
            htmlFor="email"
            required
            error={errors.email}
          >
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="john@example.com"
              className={inputClasses(!!errors.email)}
              aria-invalid={!!errors.email}
            />
          </FieldWrapper>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FieldWrapper
            label="Mobile Number"
            htmlFor="mobile"
            required
            error={errors.mobile}
          >
            <input
              id="mobile"
              type="tel"
              autoComplete="tel"
              value={formData.mobile}
              onChange={(e) => handleChange("mobile", e.target.value)}
              placeholder="9876543210"
              className={inputClasses(!!errors.mobile)}
              aria-invalid={!!errors.mobile}
            />
          </FieldWrapper>

          <FieldWrapper label="CA Firm / Company Name" htmlFor="company">
            <input
              id="company"
              type="text"
              autoComplete="organization"
              value={formData.company}
              onChange={(e) => handleChange("company", e.target.value)}
              placeholder="ABC Associates"
              className={inputClasses()}
            />
          </FieldWrapper>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FieldWrapper label="Number of Team Members" htmlFor="teamSize">
            <select
              id="teamSize"
              value={formData.teamSize}
              onChange={(e) => handleChange("teamSize", e.target.value)}
              className={`${inputClasses()} appearance-none`}
            >
              <option value="" className="bg-dark">
                Select team size
              </option>
              {TEAM_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option} className="bg-dark">
                  {option}
                </option>
              ))}
            </select>
          </FieldWrapper>

          <FieldWrapper label="Subject" htmlFor="subject">
            <input
              id="subject"
              type="text"
              value={formData.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
              placeholder="Need Product Demo"
              className={inputClasses()}
            />
          </FieldWrapper>
        </div>

        <FieldWrapper
          label="Message"
          htmlFor="message"
          required
          error={errors.message}
        >
          <textarea
            id="message"
            rows={5}
            value={formData.message}
            onChange={(e) => handleChange("message", e.target.value)}
            placeholder="Tell us a bit about what you're looking for..."
            className={`${inputClasses(!!errors.message)} resize-none`}
            aria-invalid={!!errors.message}
          />
        </FieldWrapper>

        <button
          type="submit"
          disabled={isSubmitting}
          className="group flex w-full items-center justify-center gap-2 rounded-full bg-taupe-400 px-7 py-3.5 text-sm font-semibold text-dark transition-all duration-300 hover:bg-taupe-300 hover:shadow-[0_0_0_4px_rgba(194,168,120,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Opening WhatsApp...
            </>
          ) : (
            <>
              Send Message
              <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </>
          )}
        </button>

        <p className="text-center text-xs text-light/40">
          Clicking send opens WhatsApp with your message pre-filled, nothing is
          sent automatically.
        </p>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default function ContactPage() {
  return (
    <main className="bg-light px-6 py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl items-start gap-14 lg:grid-cols-2 lg:gap-20">
        <ContactInfo />
        <ContactForm />
      </div>
    </main>
  );
}
