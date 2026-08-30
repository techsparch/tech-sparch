import Link from "next/link";

/**
 * Delete Account — TechSparch
 * Developed by Vedayana Technology Private Limited
 *
 * This page is the public "Account Deletion URL" submitted to Google Play
 * Console. It must remain publicly accessible without login.
 *
 * ASSUMPTIONS / TODOs (please adjust to match your actual project):
 * 1. Same design-token convention as the privacy policy page: bg-background,
 *    text-foreground, text-muted-foreground, border-border, bg-card,
 *    bg-primary, text-primary — no new colors introduced.
 * 2. If your project has real <Header /> and <Footer /> components rendered
 *    globally in app/layout.tsx, delete the placeholder <header>/<footer>
 *    markup below so they aren't duplicated.
 * 3. If you have existing <Card />, <Button />, or <Container /> components,
 *    swap them in at the spots marked // TODO.
 * 4. Fill in [YOUR SUPPORT EMAIL] — nothing has been invented.
 * 5. Route: app/delete-account/page.tsx (Next.js App Router).
 * 6. This page intentionally has NO auth check / redirect — it must stay
 *    reachable by a logged-out browser (including the Play Store reviewer).
 */


const SUPPORT_EMAIL = "techspatch.ss@gmail.com";
const MAILTO_SUBJECT = encodeURIComponent("TechSparch Account Deletion Request");
const MAILTO_BODY = encodeURIComponent(
  "Full name:\nRegistered email address:\nRegistered mobile number:\n\nI would like to request deletion of my TechSparch account and associated data."
);

export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* TODO: replace with your existing <Header /> if rendered globally */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
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

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Page heading */}
        <section>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Delete Account
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Request deletion of your TechSparch account and associated data.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            This page is publicly accessible and does not require you to log
            in to TechSparch.
          </p>
        </section>

        {/* Introduction */}
        <section className="mt-8 rounded-lg border border-border bg-card p-6 sm:p-8">
          <p className="leading-relaxed text-muted-foreground">
            Users of{" "}
            <span className="font-medium text-foreground">TechSparch</span>,
            developed by{" "}
            <span className="font-medium text-foreground">
              Vedayana Technology Private Limited
            </span>
            , may request deletion of their account and associated personal
            data through this page. We take user privacy seriously, and all
            deletion requests are reviewed and handled securely in line with
            our{" "}
            <Link
              href="/privacy-policy"
              className="font-medium text-primary underline underline-offset-2"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        {/* How to request deletion — steps */}
        <section className="mt-10" aria-labelledby="how-to-request-heading">
          <h2
            id="how-to-request-heading"
            className="text-xl font-semibold tracking-tight sm:text-2xl"
          >
            How to Request Account Deletion
          </h2>

          <ol className="mt-6 space-y-5">
            <Step
              number={1}
              title="Contact Us"
              description={
                <>
                  Submit an account deletion request to our support email:{" "}
                  <a
                    href={`mailto:${SUPPORT_EMAIL}?subject=${MAILTO_SUBJECT}&body=${MAILTO_BODY}`}
                    className="font-medium text-primary underline underline-offset-2"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                  .
                </>
              }
            />
            <Step
              number={2}
              title="Provide Account Information"
              description={
                <>
                  Include information that helps us identify your account,
                  such as your full name, registered email address,
                  registered mobile number, and any other information
                  reasonably required to verify account ownership.
                </>
              }
            />
            <Step
              number={3}
              title="Verification"
              description={
                <>
                  We may verify your request to confirm that it is made by
                  the actual account owner before proceeding.
                </>
              }
            />
            <Step
              number={4}
              title="Account Deletion"
              description={
                <>
                  Once your request is verified, your account and eligible
                  associated data will be scheduled for deletion in
                  accordance with our applicable policies and legal
                  requirements.
                </>
              }
            />
          </ol>
        </section>

        {/* What data will be deleted */}
        <section className="mt-10" aria-labelledby="data-deleted-heading">
          <h2
            id="data-deleted-heading"
            className="text-xl font-semibold tracking-tight sm:text-2xl"
          >
            What Data Will Be Deleted
          </h2>
          <p className="mt-3 text-muted-foreground">
            Where applicable, the following information associated with your
            account may be deleted:
          </p>
          <BulletList
            items={[
              "User profile information",
              "Account information",
              "Login and account-related information",
              "Personal information",
              "User-created tasks and related account data",
              "User-specific application data",
              "Other data associated with your account that is eligible for deletion",
            ]}
          />
          <p className="mt-3 text-sm text-muted-foreground">
            The scope of deletion depends on applicable legal and operational
            requirements, as described below.
          </p>
        </section>

        {/* Uploaded documents */}
        <section className="mt-10" aria-labelledby="documents-heading">
          <h2
            id="documents-heading"
            className="text-xl font-semibold tracking-tight sm:text-2xl"
          >
            Uploaded Documents
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            TechSparch allows users to upload documents through the
            application. When an account deletion request is approved,
            documents associated with your account may also be deleted where
            applicable.
          </p>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            However, some information or documents may need to be retained
            where required by law, accounting requirements, dispute
            resolution, fraud prevention, security, or other legitimate
            business or legal obligations. We cannot guarantee that every
            document will be immediately and permanently deleted in every
            case where such retention requirements apply.
          </p>
        </section>

        {/* Subscription and payment information */}
        <section className="mt-10" aria-labelledby="payments-heading">
          <h2
            id="payments-heading"
            className="text-xl font-semibold tracking-tight sm:text-2xl"
          >
            Subscription and Payment Information
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Deleting your account does not necessarily mean that all records
            required for financial, accounting, tax, payment, or legal
            purposes can be immediately deleted. Payment transactions within
            TechSparch may be processed through third-party payment
            providers such as Razorpay, and certain transaction or invoice
            records may be retained where required by law or legitimate
            business requirements.
          </p>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            TechSparch does not store complete card numbers, UPI
            credentials, banking login details, or other sensitive payment
            credentials.
          </p>
        </section>

        {/* What may be retained */}
        <section className="mt-10" aria-labelledby="retained-heading">
          <h2
            id="retained-heading"
            className="text-xl font-semibold tracking-tight sm:text-2xl"
          >
            What May Be Retained
          </h2>
          <p className="mt-3 text-muted-foreground">
            Some information may be retained, even after account deletion,
            where necessary for:
          </p>
          <BulletList
            items={[
              "Legal compliance",
              "Tax and accounting requirements",
              "Financial record-keeping",
              "Fraud prevention",
              "Security",
              "Dispute resolution",
              "Enforcement of our agreements",
              "Other legitimate business requirements",
            ]}
          />
          <p className="mt-3 text-sm text-muted-foreground">
            Any information retained for these purposes will only be kept
            for as long as reasonably necessary for the applicable purpose.
          </p>
        </section>

        {/* CTA — Request account deletion */}
        <section
          className="mt-12 rounded-lg border border-border bg-card p-6 text-center sm:p-10"
          aria-labelledby="cta-heading"
        >
          <h2
            id="cta-heading"
            className="text-2xl font-semibold tracking-tight"
          >
            Request Account Deletion
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            To request deletion of your TechSparch account and associated
            data, contact us using the support email below.
          </p>
          <p className="mt-4 text-lg font-medium text-foreground">
            {SUPPORT_EMAIL}
          </p>
          {/* TODO: replace with your existing <Button /> component */}
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=${MAILTO_SUBJECT}&body=${MAILTO_BODY}`}
            className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Request Account Deletion
          </a>
        </section>

        {/* Important notice */}
        <section
          className="mt-10 rounded-lg border border-border bg-card p-6 sm:p-8"
          aria-labelledby="notice-heading"
        >
          <h2
            id="notice-heading"
            className="text-xl font-semibold tracking-tight sm:text-2xl"
          >
            Important Notice
          </h2>
          <BulletList
            items={[
              "Account deletion is generally irreversible once completed.",
              "You may lose access to your account and associated services.",
              "Active subscriptions or services may be affected.",
              "Some records may be retained when required by law or legitimate business requirements.",
              "Verification may be required before we process your request.",
            ]}
          />
        </section>

        {/* Processing time */}
        <section className="mt-10" aria-labelledby="processing-heading">
          <h2
            id="processing-heading"
            className="text-xl font-semibold tracking-tight sm:text-2xl"
          >
            Processing Time
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Deletion requests will be reviewed and processed within a
            reasonable period after successful verification, subject to
            applicable legal and operational requirements.
          </p>
        </section>

        {/* Privacy policy link */}
        <section className="mt-10" aria-labelledby="privacy-link-heading">
          <h2
            id="privacy-link-heading"
            className="text-xl font-semibold tracking-tight sm:text-2xl"
          >
            Privacy Policy
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            For more information about how we collect, use, store, and
            protect personal information, please review our{" "}
            <Link
              href="/privacy-policy"
              className="font-medium text-primary underline underline-offset-2"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        {/* Contact information */}
        <section className="mt-10" aria-labelledby="contact-heading">
          <h2
            id="contact-heading"
            className="text-xl font-semibold tracking-tight sm:text-2xl"
          >
            Contact Information
          </h2>
          <div className="mt-4 rounded-lg border border-border bg-card p-5">
            <p className="font-semibold text-foreground">
              Vedayana Technology Private Limited
            </p>
            <p className="text-muted-foreground">
              Product: <span className="text-foreground">TechSparch</span>
            </p>
            <p className="text-muted-foreground">
              Website:{" "}
              <a
                href="https://www.techsparch.com/"
                className="font-medium text-primary underline underline-offset-2"
              >
                https://www.techsparch.com/
              </a>
            </p>
            <p className="text-muted-foreground">
              Support Email:{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-medium text-primary underline underline-offset-2"
              >
                {SUPPORT_EMAIL}
              </a>
            </p>
          </div>
        </section>
      </main>

      {/* TODO: replace with your existing <Footer /> if rendered globally */}
      <footer className="mt-12 border-t border-border">
        <div className="mx-auto max-w-4xl px-4 py-8 text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} Vedayana Technology Private
            Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}) {
  return (
    <li className="flex gap-4 rounded-lg border border-border bg-card p-5">
      <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
        {number}
      </span>
      <div>
        <p className="font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-muted-foreground">{description}</p>
      </div>
    </li>
  );
}

function BulletList({ items }) {
  return (
    <ul className="ml-1 mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground marker:text-primary">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}


