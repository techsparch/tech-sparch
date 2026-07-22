"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();

  const [form, setForm] = useState({
    mobile: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  // ✅ ONLY store raw input (no formatting here)
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ format only when user leaves field (mobile safe)
  const handleBlur = (e) => {
    const { name } = e.target;

    if (name === "mobile") {
      const clean = form.mobile.replace(/[^0-9]/g, "").slice(0, 10);

      const formatted =
        clean.length <= 5 ? clean : clean.slice(0, 5) + "-" + clean.slice(5);

      setForm((prev) => ({
        ...prev,
        mobile: formatted,
      }));
    }
  };

  const unformatMobile = (value) => value.replace(/[^0-9]/g, "");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.mobile || !form.password) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      await signIn("credentials", {
        redirect: true,
        callbackUrl: "/dashboard",
        mobile: unformatMobile(form.mobile),
        password: form.password,
      });
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-dark/70 p-4 sm:p-6">
      {/* Subtle Background Blobs to match your landing page style */}
      <div className="absolute -left-48 -top-48 h-96 w-96 rounded-full bg-taupe-500/20 blur-[100px]" />
      <div className="absolute -bottom-48 -right-48 h-96 w-96 rounded-full bg-light/10 blur-[100px]" />

      <div className="relative z-10 w-full max-w-lg rounded-[2.5rem] bg-light p-8 shadow-2xl sm:p-12">
        {/* Brand / Logo Area */}
        <div className="mb-8 text-center">
          <h1 className="tracking-wider text-lg">techsparch</h1>
          <p className="text-2xl font-black tracking-tighter text-dark">
            SAKSHAM{"  "}
            <span className="text-taupe-500/80 tracking-tighter ">
              SOLUTIONS
            </span>
          </p>

          <p className="mt-2 text-sm text-dark/90">
            Secure access to your workspace
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* MOBILE */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-dark/80">
              Mobile Number
            </label>
            <input
              name="mobile"
              type="tel"
              inputMode="numeric"
              value={form.mobile}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter register mobile number"
              className="w-full rounded-2xl border border-dark/10 bg-light/50 px-4 py-3.5 text-dark transition-all placeholder:text-gray-400 focus:border-taupe-500/ focus:bg-white focus:outline-none focus:ring-4 focus:ring-taupe-500/10"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-dark/80">
              Password
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full rounded-2xl border border-dark/10 bg-light/50 px-4 py-3.5 text-dark transition-all placeholder:text-gray-400 focus:border-taupe-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-taupe-500/10"
            />
          </div>

          {/* PRIMARY BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center rounded-full bg-[#061E29] px-8 py-4 text-base font-bold text-white transition-all duration-300 hover:bg-[#0a2a3a] hover:shadow-lg hover:shadow-[#061E29]/20 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Secure Login"}
          </button>
        </form>

        {/* DIVIDER */}
        <div className="my-8 flex items-center">
          <div className="h-px flex-1 bg-dark/10"></div>
          <span className="px-4 text-xs font-semibold tracking-wider text-dark/40">
            OR
          </span>
          <div className="h-px flex-1 bg-dark/10"></div>
        </div>

        {/* SECONDARY BUTTON */}
        <button
          onClick={() => router.push("/login/access-login")}
          className="flex w-full items-center justify-center rounded-full border border-dark/10 bg-transparent px-8 py-4 text-base font-bold text-dark transition-all duration-300 hover:bg-dark/5"
        >
          Login with Access Code
        </button>

        {/* FOOTER */}
        <p className="mt-8 text-center text-xs font-medium text-dark/40">
          Secure access • Smart permissions • CA workflow system
        </p>
      </div>
    </div>
  );
};

export default Page;
