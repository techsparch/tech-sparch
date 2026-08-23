"use client";

import { useState } from "react";
import {
  CreditCard,
  ShieldCheck,
  LogOut,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function MakePaymentPage() {
  // Use a string to track which plan is loading ("monthly" or "yearly")
  const [loadingPlan, setLoadingPlan] = useState(null);
  const { update } = useSession();
  const router = useRouter();

  // Dynamically load the Razorpay SDK script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (planType) => {
    setLoadingPlan(planType);

    try {
      // 1. Load Razorpay
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Razorpay SDK failed to load. Are you online?");
      }

      // 2. Create the subscription on your backend, passing the planType
      const createRes = await fetch("/api/subscription/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planType }),
      });
      const createData = await createRes.json();

      if (!createRes.ok) {
        throw new Error(createData.message || "Failed to create subscription");
      }

      // 3. Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: createData.subscriptionId, // From your create API
        name: "SP Consultancy",
        description: `${planType === "monthly" ? "Monthly" : "Yearly"} Service Subscription`,
        handler: async function (response) {
          try {
            // 4. Verify payment signature on your backend
            const verifyRes = await fetch("/api/subscription/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              throw new Error(verifyData.message || "Verification failed");
            }

            toast.success("Payment successful! Redirecting...");

            // 5. Update NextAuth session immediately so layout lets them in
            await update({ serviceEnabled: true });
            router.push("/dashboard/client");
            router.refresh();
          } catch (err) {
            toast.error(err.message || "Payment verification failed");
          }
        },
        theme: {
          color: "#2563eb", // Matches your blue-600 button
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        toast.error(response.error.description || "Payment failed");
      });

      rzp.open();
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 py-12">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-slate-900 p-8 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Select Your Plan
          </h1>
          <p className="text-slate-300 text-sm max-w-lg mx-auto">
            Your service is currently inactive. Please choose a subscription
            plan to access your dashboard.
          </p>
        </div>

        {/* Pricing Cards Section */}
        <div className="p-8 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Monthly Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col transition-transform hover:scale-[1.02]">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Monthly Plan
                </h3>
                <div className="flex items-end mt-2">
                  <span className="text-4xl font-extrabold text-gray-900">
                    ₹49
                  </span>
                  <span className="text-gray-500 ml-1 mb-1 font-medium">
                    /mo
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-8 flex-grow">
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Full access to the client dashboard</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Unlimited task management</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Priority 24/7 support</span>
                </div>
              </div>

              <button
                onClick={() => handlePayment("monthly")}
                disabled={loadingPlan !== null}
                className="w-full flex items-center justify-center bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loadingPlan === "monthly" ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />{" "}
                    Processing...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 mr-2" /> Pay Monthly
                  </>
                )}
              </button>
            </div>

            {/* Yearly Card (Highlighted) */}
            <div className="bg-white rounded-2xl border-2 border-blue-600 p-6 shadow-md relative flex flex-col transition-transform hover:scale-[1.02]">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg uppercase tracking-wide">
                Best Value
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-blue-700">
                  Yearly Plan
                </h3>
                <div className="flex items-end mt-2">
                  <span className="text-4xl font-extrabold text-gray-900">
                    ₹499
                  </span>
                  <span className="text-gray-500 ml-1 mb-1 font-medium">
                    /yr
                  </span>
                </div>
                <p className="text-sm text-green-600 font-medium mt-1">
                  Save 16% annually
                </p>
              </div>

              <div className="space-y-3 mb-8 flex-grow">
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Everything in Monthly</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Two months completely free</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Dedicated account manager</span>
                </div>
              </div>

              <button
                onClick={() => handlePayment("yearly")}
                disabled={loadingPlan !== null}
                className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loadingPlan === "yearly" ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />{" "}
                    Processing...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 mr-2" /> Pay Yearly
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center border-t border-gray-200 pt-6">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center justify-center bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium py-2.5 px-6 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out & Return Later
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-white p-4 text-center border-t border-gray-100">
          <p className="text-xs text-gray-500 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 mr-1 text-gray-400" />
            Payments are 100% secure and encrypted.
          </p>
        </div>
      </div>
    </div>
  );
}
