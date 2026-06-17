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
        clean.length <= 5
          ? clean
          : clean.slice(0, 5) + "-" + clean.slice(5);

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
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-50 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 border rounded-2xl shadow-xl p-8 w-full max-w-md">

        <h1 className="text-2xl font-bold text-center mb-6">
          Secure access to your workspace
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* MOBILE */}
          <div>
            <label className="text-sm">Mobile Number</label>
            <input
              name="mobile"
              type="tel"
              inputMode="numeric"
              value={form.mobile}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter mobile number"
              className="w-full mt-1 p-3 rounded-lg border bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full mt-1 p-3 rounded-lg border bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        {/* EXTRA */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
          <span className="px-3 text-xs text-gray-500">OR</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
        </div>

        <button
          onClick={() => router.push("/login/access-login")}
          className="w-full border py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Login with Access Code
        </button>

        <p className="text-xs text-center text-gray-500 mt-6">
          Secure access • Smart permissions • CA workflow system
        </p>
      </div>
    </div>
  );
};

export default Page;