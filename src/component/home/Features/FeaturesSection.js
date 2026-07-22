import { FileText, CreditCard, Activity, ArrowUpRight } from "lucide-react";

export default function FeaturesSection() {
  return (
    <section className="bg-dark/75 py-24 relative z-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl antialiased">
            Everything you need, <br className="hidden sm:block" />
            in one secure place.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-light/70">
            Skip the endless emails. Manage your documents, filings, and
            invoices in one secure portal.
          </p>
        </div>

        {/* Features Grid */}
     <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
  {/* Card 1: Documents */}
  <div className="group relative overflow-hidden rounded-3xl border border-dark/5 bg-white p-4 transition-all duration-500 hover:border-dark/10 hover:shadow-2xl hover:shadow-dark/5">
    {/* Subtle Hover Gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-taupe-100/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    
    <div className="relative z-10">
      <div className="mb-8 flex items-start justify-between">
        <div className="rounded-full bg-light p-3 text-dark ring-1 ring-dark/10 transition-transform duration-500 group-hover:scale-110 group-hover:bg-dark group-hover:text-light">
          <FileText className="h-6 w-6" strokeWidth={1.5} />
        </div>
        {/* Animated Corner Arrow */}
        <ArrowUpRight className="h-6 w-6 text-dark/40 opacity-0 -translate-x-2 translate-y-2 transition-all duration-500 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
      </div>
      <h3 className="mb-3 text-xl font-bold text-dark">
        Secure Document Vault
      </h3>
      <p className="text-sm leading-relaxed text-dark/60">
        Safely upload, e-sign, and store your important tax forms and financial records with enterprise-grade encryption.
      </p>
    </div>
  </div>

  {/* Card 2: Invoices */}
  <div className="group relative overflow-hidden rounded-3xl border border-dark/5 bg-white p-4 transition-all duration-500 hover:border-dark/10 hover:shadow-2xl hover:shadow-dark/5">
    <div className="absolute inset-0 bg-gradient-to-br from-taupe-100/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    <div className="relative z-10">
      <div className="mb-8 flex items-start justify-between">
        <div className="rounded-full bg-light p-3 text-dark ring-1 ring-dark/10 transition-transform duration-500 group-hover:scale-110 group-hover:bg-dark group-hover:text-light">
          <CreditCard className="h-6 w-6" strokeWidth={1.5} />
        </div>
        <ArrowUpRight className="h-6 w-6 text-dark/40 opacity-0 -translate-x-2 translate-y-2 transition-all duration-500 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
      </div>
      <h3 className="mb-3 text-xl font-bold text-dark">
        Invoice Management
      </h3>
      <p className="text-sm leading-relaxed text-dark/60">
        View outstanding balances, track payment history, and settle your invoices directly through the portal in seconds.
      </p>
    </div>
  </div>

  {/* Card 3: Tracking */}
  <div className="group relative overflow-hidden rounded-3xl border border-dark/5 bg-white p-4 transition-all duration-500 hover:border-dark/10 hover:shadow-2xl hover:shadow-dark/5">
    <div className="absolute inset-0 bg-gradient-to-br from-taupe-100/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    <div className="relative z-10">
      <div className="mb-8 flex items-start justify-between">
        <div className="rounded-full bg-light p-3 text-dark ring-1 ring-dark/10 transition-transform duration-500 group-hover:scale-110 group-hover:bg-dark group-hover:text-light">
          <Activity className="h-6 w-6" strokeWidth={1.5} />
        </div>
        <ArrowUpRight className="h-6 w-6 text-dark/40 opacity-0 -translate-x-2 translate-y-2 transition-all duration-500 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
      </div>
      <h3 className="mb-3 text-xl font-bold text-dark">
        Real-Time Tracking
      </h3>
      <p className="text-sm leading-relaxed text-dark/60">
        Always know the exact status of your tax returns, audits, and compliance filings without ever having to ask.
      </p>
    </div>
  </div>
</div>
      </div>
    </section>
  );
}
