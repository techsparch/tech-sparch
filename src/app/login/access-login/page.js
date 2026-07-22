"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function Page() {
  const router = useRouter();

  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!accessCode) {
      toast.error("Enter access code");
      return;
    }

    setLoading(true);

    const res = await signIn("access-code", {
      redirect: false,
      accessCode,
    });

    setLoading(false);

    if (!res?.ok) {
      toast.error(res?.error || "Invalid access code");
      return;
    }

    toast.success("Welcome 🎉");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <Loader2 className="animate-spin text-white w-10 h-10" />
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-8 rounded-xl border bg-white dark:bg-gray-900"
      >
        <h1 className="text-2xl font-bold mb-4">Access Code Login</h1>

        <input
          type="text"
          placeholder="Enter Access Code (SP-X7-K2)"
          value={accessCode}
          name="accessCode"
          onChange={(e) => setAccessCode(e.target.value)}
          className="w-full p-3 border rounded-lg mb-4"
        />

        <button
          className="w-full bg-orange-600 text-white py-3 rounded-lg"
          disabled={loading}
        >
          Login
        </button>
      </form>
    </div>
  );
}
