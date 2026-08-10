"use client";

import { useState, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const PREFIX = "TS";
const CODE_LENGTH = 4;
export default function Page() {
  const router = useRouter();

  const [codeChars, setCodeChars] = useState(Array(CODE_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef([]);
  const accessCode = `${PREFIX}-${codeChars.join("")}`;

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    // allow letters and numbers only, force uppercase
    const char = value
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(-1)
      .toUpperCase();

    const next = [...codeChars];
    next[index] = char;
    setCodeChars(next);

    if (char && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (codeChars[index]) {
        const next = [...codeChars];
        next[index] = "";
        setCodeChars(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        const next = [...codeChars];
        next[index - 1] = "";
        setCodeChars(next);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    let pasted = e.clipboardData.getData("text").toUpperCase();

    // strip the fixed prefix and any separators if the user pastes the full code
    pasted = pasted
      .replace(/^TS-?/, "")
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, CODE_LENGTH);

    if (!pasted) return;

    const next = Array(CODE_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setCodeChars(next);

    const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (codeChars.some((c) => !c)) {
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
    <div className="min-h-screen flex items-center justify-center bg-dark/70">
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

        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Enter Access Code
        </label>
        <div
          className="mb-4 flex items-center justify-between gap-2"
          onPaste={handlePaste}
        >
          {/* Fixed "T" column */}
          <input
            type="text"
            value="T"
            disabled
            readOnly
            className="h-12 w-full min-w-0 rounded-lg border bg-gray-100 text-center font-mono text-lg font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400"
          />
          {/* Fixed "S" column */}
          <input
            type="text"
            value="S"
            disabled
            readOnly
            className="h-12 w-full min-w-0 rounded-lg border bg-gray-100 text-center font-mono text-lg font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400"
          />
          {/* Fixed "-" column */}
          <input
            type="text"
            value="-"
            disabled
            readOnly
            className="h-12 w-full min-w-0 rounded-lg border bg-gray-100 text-center font-mono text-lg font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400"
          />
          {/* Editable columns */}
          {codeChars.map((char, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength={1}
              autoComplete="off"
              value={char}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="h-12 w-full min-w-0 rounded-lg border text-center font-mono text-lg font-semibold uppercase focus:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-600/20"
            />
          ))}
        </div>

        <button
          className="mt-4 flex w-full items-center justify-center rounded-full bg-[#061E29] px-8 py-4 text-base font-bold text-white transition-all duration-300 hover:bg-[#0a2a3a] hover:shadow-lg hover:shadow-[#061E29]/20 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={loading}
        >
          Login
        </button>
      </form>
    </div>
  );
}
