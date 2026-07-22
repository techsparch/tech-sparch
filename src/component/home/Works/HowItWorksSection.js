import { UserPlus, FileSearch, CheckCircle2 } from "lucide-react";

export default function HowItWorksSection() {
  return (
    <section className="bg-light py-24 relative overflow-hidden ">
      {/* Background decoration (Subtle grid or glow) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#093C5D1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="mb-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-dark sm:text-4xl lg:text-5xl">
            Seamless compliance in{" "}
            <span className="text-taupe-400">three steps.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-dark/70">
            We’ve eliminated the friction from financial management. Here is how
            your new workflow looks.
          </p>
        </div>

        {/* Steps Container */}
        <div className="relative grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
          {/* Connecting Line for Desktop */}
          <div className="hidden lg:block absolute top-12 left-1/6 right-1/6 h-[1px] bg-gradient-to-r from-transparent via-taupe-500/30 to-transparent z-0" />

          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-center text-center group">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-dark/5 border border-light/10 text-dark-400 backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:border-taupe-400/50 group-hover:bg-taupe-400/10">
              <UserPlus className="h-7 w-7 text-taupe-400" strokeWidth={2} />
            </div>
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-dark text-sm font-bold text-light">
              1
            </div>
            <h3 className="mb-3 text-xl font-bold text-dark">
              Onboard & Upload
            </h3>
            <p className="text-dark/60 leading-relaxed max-w-sm">
              Create your secure account and drop your documents into the
              encrypted vault. No more digging through email attachments.
            </p>
          </div>

          <div className="group relative z-10 flex flex-col items-center text-center">
            {/* Icon Container with Animated Border */}
            <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full transition-transform duration-500 group-hover:scale-110">
              {/* 1. Default Static Background & Border (Fades out on hover) */}
              <div className="absolute inset-0 rounded-full border border-dark/10 bg-dark/5 transition-opacity duration-500 group-hover:opacity-0" />

              {/* 2. Spinning Gradient Wrapper (Fades in on hover) */}
              <div className="absolute inset-0 overflow-hidden rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                {/* The actual spinning gradient now using taupe.400 */}
                <div className="absolute -inset-[100%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,transparent_60%,theme(colors.taupe.400)_100%)]" />
              </div>

              {/* 3. Inner Mask (Covers the middle of the spinning gradient) */}
              <div className="absolute inset-[1.5px] rounded-full bg-white opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              {/* 4. The Icon (Elevated with z-10 so it sits above the background) */}
              <FileSearch
                className="relative z-10 h-10 w-10 text-dark/70 transition-colors duration-500 group-hover:text-dark"
                strokeWidth={2}
              />
            </div>

            {/* Step Number Badge */}
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-dark text-sm font-bold text-light transition-transform duration-500 group-hover:-translate-y-1">
              2
            </div>

            {/* Text Content */}
            <h3 className="mb-3 text-xl font-bold text-dark">
              We Do the Heavy Lifting
            </h3>
            <p className="max-w-sm text-dark/60 leading-relaxed transition-colors duration-500 group-hover:text-dark/80">
              Our experts analyze your data, prepare your filings, and optimize
              your tax position while you track progress in real-time.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-center text-center group">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-dark/5 border border-light/10 text-taupe-400 backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:border-taupe-400/50 group-hover:bg-taupe-400/10">
              <CheckCircle2 className="h-10 w-10" strokeWidth={1.5} />
            </div>
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-dark text-sm font-bold text-light">
              3
            </div>
            <h3 className="mb-3 text-xl font-bold text-dark">
              Review & E-Sign
            </h3>
            <p className="text-dark/60 leading-relaxed max-w-sm">
              Review your completed drafts and e-sign directly in the portal.
              Pay your invoice securely and you are completely done.
            </p>
          </div>
        </div>
      </div>

    </section>
  );
}
