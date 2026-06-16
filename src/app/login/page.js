"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
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
  const formatMobile = (value) => {
    const clean = value.replace(/[^0-9]/g, "").slice(0, 10);

    if (clean.length <= 5) return clean;

    return clean.slice(0, 5) + "-" + clean.slice(5);
  };

  const unformatMobile = (value) => {
    return value.replace(/[^0-9]/g, "");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile") {
      setForm({
        ...form,
        mobile: formatMobile(value),
      });
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }
  };

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
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden bg-slate-50 dark:bg-gray-950">
      <div className="absolute w-[600px] h-[600px] bg-blue-400/20 blur-[120px] rounded-full top-[-200px] left-[-200px]"></div>
      <div className="absolute w-[500px] h-[500px] bg-indigo-400/20 blur-[120px] rounded-full bottom-[-200px] right-[-200px]"></div>

      {/* Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Title */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight font-google">
            Secure access to your workspace
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">
              Mobile Number
            </label>
            <input
              name="mobile"
              type="text"
              placeholder="Enter mobile number"
              value={form.mobile}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-lg border bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-lg border bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
          <span className="px-3 text-xs text-gray-500">OR</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
        </div>

        {/* Access Code */}
        <button
          onClick={() => router.push("/login/access-login")}
          className="w-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 py-3 rounded-lg transition"
        >
          Login with Access Code
        </button>

        {/* Footer */}
        <p className="text-xs text-center text-gray-500 mt-6">
          Secure access • Smart permissions • CA workflow system
        </p>
      </div>
    </div>
  );
};

export default Page;
