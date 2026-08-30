
/**
 * Privacy Policy — TechSparch
 * Developed by Vedayana Technology Private Limited
 *
 * ASSUMPTIONS / TODOs (please adjust to match your actual project):
 * 1. This file assumes a shadcn/ui-style Tailwind setup with CSS variable
 *    tokens (bg-background, text-foreground, text-muted-foreground,
 *    border-border, bg-card, bg-primary, etc.) — the same class names you
 *    referenced. No new tokens or colors are introduced anywhere below.
 * 2. If your project has real <Header /> and <Footer /> components, import
 *    and use them instead of the placeholder wrappers marked TODO — remove
 *    the placeholder <header>/<footer> markup in that case, since your root
 *    layout likely already renders them and this page should not duplicate
 *    them.
 * 3. If you have an existing <Breadcrumbs />, <Container />, <Card />, or
 *    <Button /> component, swap the equivalent markup below for it — the
 *    spots are marked with // TODO: replace with your <Component />.
 * 4. Fill in [YOUR SUPPORT EMAIL] and [YOUR WEBSITE URL] — nothing has been
 *    invented on your behalf.
 * 5. Route: app/privacy-policy/page.tsx (Next.js App Router).
 */

import Link from "next/link";

const EFFECTIVE_DATE = "30 August 2026";
const LAST_UPDATED = "30 August 2026";
const SUPPORT_EMAIL = "techsparch.ss@gmail.com";
const WEBSITE_URL = "https://www.techsparch.com/";

const sections = [
  { id: "introduction", label: "1. Privacy Policy" },
  { id: "information-we-collect", label: "2. Information We Collect" },
  { id: "documents-and-user-content", label: "3. Documents & User Content" },
  { id: "how-we-use-information", label: "4. How We Use Information" },
  { id: "payments", label: "5. Payments" },
  { id: "third-party-services", label: "6. Third-Party Services" },
  { id: "data-security", label: "7. Data Security" },
  { id: "data-retention", label: "8. Data Retention" },
  { id: "data-sharing", label: "9. Data Sharing" },
  { id: "user-rights", label: "10. User Rights" },
  { id: "account-deletion", label: "11. Account Deletion" },
  { id: "childrens-privacy", label: "12. Children's Privacy" },
  { id: "cookies", label: "13. Cookies & Tracking" },
  { id: "changes", label: "14. Changes to This Policy" },
  { id: "contact-us", label: "15. Contact Us" },
];




export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* TODO: replace with your existing <Header /> component if your
          root layout does not already render one globally. */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            TechSparch
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Breadcrumbs — TODO: replace with your existing <Breadcrumbs /> */}
      <nav
        aria-label="Breadcrumb"
        className="mx-auto max-w-6xl px-4 pt-6 text-sm text-muted-foreground sm:px-6 lg:px-8"
      >
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground">Privacy Policy</li>
        </ol>
      </nav>

      {/* Page header */}
      <section className="mx-auto max-w-6xl px-4 pb-8 pt-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          This Privacy Policy explains how{" "}
          <span className="font-medium text-foreground">
            Vedayana Technology Private Limited
          </span>{" "}
          collects, uses, stores, and protects information in connection with{" "}
          <span className="font-medium text-foreground">TechSparch</span>,
          our CA Management and Client Portal application.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="rounded-full border border-border bg-card px-3 py-1">
            Effective Date: {EFFECTIVE_DATE}
          </span>
          <span className="rounded-full border border-border bg-card px-3 py-1">
            Last Updated: {LAST_UPDATED}
          </span>
        </div>
      </section>

      {/* Content layout: sticky ToC (desktop) + article */}
      <div className="mx-auto max-w-6xl gap-8 px-4 pb-20 sm:px-6 lg:grid lg:grid-cols-[240px_1fr] lg:px-8">
        {/* Table of Contents — desktop sticky sidebar */}
        <aside className="hidden lg:block">
          <nav
            aria-label="Table of contents"
            className="sticky top-24 rounded-lg border border-border bg-card p-4"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              On this page
            </p>
            <ul className="space-y-1 text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="block rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Mobile ToC — collapsible */}
        <details className="mb-6 rounded-lg border border-border bg-card p-4 lg:hidden">
          <summary className="cursor-pointer text-sm font-semibold">
            Table of Contents
          </summary>
          <ul className="mt-3 space-y-1 text-sm">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="block rounded-md px-2 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </details>

        {/* Article */}
        <article
          className="min-w-0 scroll-smooth [&_h2]:scroll-mt-24 [&_h3]:scroll-mt-24"
        >
          <div className="space-y-10 rounded-lg border border-border bg-card p-6 sm:p-8">
            <PolicySection id="introduction" title="1. Privacy Policy">
              <p>
                Vedayana Technology Private Limited (&ldquo;
                <strong>Vedayana Technology</strong>&rdquo;, &ldquo;we&rdquo;,
                &ldquo;us&rdquo;, or &ldquo;our&rdquo;) develops and operates
                TechSparch, a CA (Chartered Accountant) Management and Client
                Portal application (the &ldquo;Application&rdquo; or
                &ldquo;Service&rdquo;) that allows CA firms, staff, and
                clients to manage client information, documents, tasks,
                subscriptions, payments, and invoices.
              </p>
              <p>
                This Privacy Policy describes how we collect, use, disclose,
                store, and protect information when you access or use
                TechSparch through our website, web application, or
                Android/mobile application. By using TechSparch, you agree to
                the collection and use of information in accordance with this
                Policy.
              </p>
              <p>
                If you do not agree with the terms of this Privacy Policy,
                please do not access or use the Application.
              </p>
            </PolicySection>

            <PolicySection
              id="information-we-collect"
              title="2. Information We Collect"
            >
              <p>
                We collect information that you provide directly to us, that
                is generated through your use of the Application, and that is
                collected automatically. Depending on your role (CA, staff,
                or client) and how you use TechSparch, this may include:
              </p>
              <BulletList
                items={[
                  "Full name",
                  "Mobile number",
                  "Email address",
                  "Account and login information (such as username and encrypted password)",
                  "Profile information",
                  "CA, client, and staff information (such as firm details, roles, and assignments)",
                  "Documents and files uploaded to the Application",
                  "Tasks and work-related information",
                  "Subscription information (such as plan type and billing cycle)",
                  "Payment and transaction information",
                  "Invoice information",
                  "Device information (such as device type and operating system)",
                  "IP address",
                  "Browser or app information",
                  "Log and usage information (such as access times and activity within the Application)",
                ]}
              />
            </PolicySection>

            <PolicySection
              id="documents-and-user-content"
              title="3. Documents and User Content"
            >
              <p>
                TechSparch enables users to upload business, accounting, tax,
                financial, and other related documents in the course of using
                the Application (&ldquo;User Content&rdquo;). In relation to
                User Content:
              </p>
              <BulletList
                items={[
                  "Files may be stored using Cloudinary, a third-party file storage and media management service, where applicable.",
                  "Necessary file metadata (such as file name, type, size, and upload date) may be stored to enable document management features.",
                  "Documents are accessible according to user roles and permissions configured within the Application (for example, CA, staff, or client access levels).",
                  "We do not sell uploaded documents or User Content.",
                  "You are solely responsible for having the necessary rights and permissions to upload any document or content to the Application.",
                ]}
              />
            </PolicySection>

            <PolicySection
              id="how-we-use-information"
              title="4. How We Use Information"
            >
              <p>We use the information we collect to:</p>
              <BulletList
                items={[
                  "Provide, operate, and manage user accounts",
                  "Manage CA firm, staff, and client relationships",
                  "Support client assignment between CAs and staff",
                  "Enable task creation, assignment, and management",
                  "Store and retrieve documents",
                  "Manage subscriptions and plan entitlements",
                  "Process payments",
                  "Generate invoices",
                  "Send notifications relevant to your account or activity",
                  "Authenticate users and secure accounts",
                  "Maintain the security of the Application",
                  "Detect and prevent fraud or misuse",
                  "Improve and develop the Application",
                  "Provide customer support",
                  "Comply with applicable legal and regulatory obligations",
                ]}
              />
            </PolicySection>

            <PolicySection id="payments" title="5. Payments">
              <p>
                Payments and subscription billing within TechSparch may be
                processed through third-party payment providers, including{" "}
                <strong>Razorpay</strong>. When you make a payment, your
                payment details are collected and processed directly by the
                relevant payment provider in accordance with their own
                privacy policy and security standards.
              </p>
              <p>
                TechSparch does not directly store complete card numbers,
                UPI credentials, banking login details, or other sensitive
                payment credentials, except where required to be retained by
                the payment provider&rsquo;s systems on our behalf. We may
                retain limited transaction records (such as payment status,
                amount, and reference identifiers) for accounting, invoicing,
                and support purposes.
              </p>
            </PolicySection>

            <PolicySection
              id="third-party-services"
              title="6. Third-Party Services"
            >
              <p>
                We work with the following categories of third-party service
                providers to operate TechSparch:
              </p>
              <BulletList
                items={[
                  "Cloudinary — file and document storage",
                  "Razorpay — payment and subscription processing",
                  "Hosting and server infrastructure providers",
                  "Database infrastructure providers",
                  "Other infrastructure, security, and notification service providers used to operate and secure the Application",
                ]}
              />
              <p>
                These providers process information only as necessary to
                deliver their respective services and are bound by their own
                privacy and security practices.
              </p>
            </PolicySection>

            <PolicySection id="data-security" title="7. Data Security">
              <p>
                We implement reasonable technical and organizational
                measures designed to protect your information, including:
              </p>
              <BulletList
                items={[
                  "Authentication mechanisms to verify user identity",
                  "Access controls restricting data access based on user role",
                  "HTTPS/encrypted communication where available",
                  "Secure handling and hashing of passwords",
                  "Token-based authentication for API and session access",
                  "Role-based access control (RBAC) for CA, staff, and client roles",
                  "Secure hosting and infrastructure practices",
                ]}
              />
              <p>
                While we take reasonable steps to protect your information,
                no method of transmission over the internet or electronic
                storage is completely secure, and we cannot guarantee
                absolute security.
              </p>
            </PolicySection>

            <PolicySection id="data-retention" title="8. Data Retention">
              <p>
                We retain personal and account information for as long as
                your account remains active, or as necessary to provide the
                Application&rsquo;s services, comply with our legal
                obligations, resolve disputes, and enforce our agreements.
                Documents, tasks, invoices, and transaction records may be
                retained for the period required for accounting, tax, or
                regulatory compliance purposes, even after account closure,
                unless deletion is requested and permitted under applicable
                law.
              </p>
            </PolicySection>

            <PolicySection id="data-sharing" title="9. Data Sharing">
              <p>
                We do not sell or rent your personal information. We may
                share information in the following circumstances:
              </p>
              <BulletList
                items={[
                  "With service providers who help us operate the Application (such as file storage, hosting, and infrastructure providers)",
                  "With payment processors to complete transactions (such as Razorpay)",
                  "With authorized CA, staff, or client users within your firm's account, based on assigned roles and permissions",
                  "With legal or regulatory authorities where required by law, regulation, or valid legal process",
                  "With security or fraud-prevention providers where necessary to protect the Application and its users",
                ]}
              />
            </PolicySection>

            <PolicySection id="user-rights" title="10. User Rights">
              <p>
                Subject to applicable law, you may have the right to:
              </p>
              <BulletList
                items={[
                  "Access the personal information we hold about you",
                  "Request correction of inaccurate or incomplete information",
                  "Request deletion of your personal information, subject to legal and contractual retention requirements",
                  "Withdraw consent where processing is based on consent",
                  "Object to or request restriction of certain processing activities",
                ]}
              />
              <p>
                To exercise any of these rights, please contact us at{" "}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="font-medium text-primary underline underline-offset-2"
                >
                  {SUPPORT_EMAIL}
                </a>
                .
              </p>
            </PolicySection>

            <PolicySection
              id="account-deletion"
              title="11. Account Deletion"
            >
              <p>
                You may request deletion of your TechSparch account and
                associated personal data at any time. To request account or
                data deletion, please contact us at{" "}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="font-medium text-primary underline underline-offset-2"
                >
                  {SUPPORT_EMAIL}
                </a>{" "}
                with your registered account details.
              </p>
              <p>
                We will process account deletion requests within a reasonable
                timeframe, subject to any legal, regulatory, accounting, or
                dispute-resolution obligations that require us to retain
                certain records (such as invoices or transaction history)
                for a defined period, even after your account is deleted.
              </p>
            </PolicySection>

            <PolicySection
              id="childrens-privacy"
              title="12. Children's Privacy"
            >
              <p>
                TechSparch is intended for use by professional users, such as
                CA firms, staff, and their clients, and is not directed to
                children. We do not knowingly collect personal information
                from children. If we become aware that we have inadvertently
                collected personal information from a child, we will take
                steps to delete such information.
              </p>
            </PolicySection>

            <PolicySection
              id="cookies"
              title="13. Cookies and Tracking Technologies"
            >
              <p>
                TechSparch may use cookies, local storage, tokens, and
                similar tracking technologies to maintain user sessions,
                remember preferences, authenticate users, and understand how
                the Application is used. You may be able to control cookies
                through your browser or device settings; however, disabling
                certain cookies may affect the functionality of the
                Application.
              </p>
            </PolicySection>

            <PolicySection id="changes" title="14. Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time to
                reflect changes in our practices, technology, legal
                requirements, or for other operational reasons. We will
                update the &ldquo;Last Updated&rdquo; date at the top of this
                page when changes are made. Continued use of TechSparch after
                changes are posted constitutes acceptance of the updated
                Policy.
              </p>
            </PolicySection>

            <PolicySection id="contact-us" title="15. Contact Us">
              <p>
                If you have any questions, concerns, or requests regarding
                this Privacy Policy or your personal information, please
                contact us:
              </p>
              <div className="mt-4 rounded-lg border border-border bg-background p-5">
                <p className="font-semibold text-foreground">
                  Vedayana Technology Private Limited
                </p>
                <p className="text-muted-foreground">
                  Product: <span className="text-foreground">TechSparch</span>
                </p>
                <p className="text-muted-foreground">
                  Email:{" "}
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="font-medium text-primary underline underline-offset-2"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                </p>
                <p className="text-muted-foreground">
                  Website:{" "}
                  <a
                    href={WEBSITE_URL}
                    className="font-medium text-primary underline underline-offset-2"
                  >
                    {WEBSITE_URL}
                  </a>
                </p>
              </div>
            </PolicySection>
          </div>

          {/* Back to top */}
          <div className="mt-8 flex justify-end">
            <a
              href="#introduction"
              className="inline-flex items-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Back to top ↑
            </a>
          </div>
        </article>
      </div>

      {/* TODO: replace with your existing <Footer /> component if your
          root layout does not already render one globally. */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} Vedayana Technology Private
            Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function PolicySection({
  id,
  title,
  children,
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`}>
      <h2
        id={`${id}-heading`}
        className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
      >
        {title}
      </h2>
      <div className="mt-3 space-y-3 leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

function BulletList({ items }) {
  return (
    <ul className="ml-1 mt-2 list-disc space-y-1.5 pl-5 marker:text-primary">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}