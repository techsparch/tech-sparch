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
  const [isLoading, setIsLoading] = useState(false);
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

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      // 1. Load Razorpay
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Razorpay SDK failed to load. Are you online?");
      }

      // 2. Create the subscription on your backend
      const createRes = await fetch("/api/subscription/create", {
        method: "POST",
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
        description: "Monthly Service Subscription",
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
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-slate-900 p-6 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Payment Required
          </h1>
          <p className="text-slate-300 text-sm">
            Your service is currently inactive. Please complete your payment to
            access the dashboard.
          </p>
        </div>

        {/* Pricing & Features Section */}
        <div className="p-6">
          <div className="flex items-end justify-center mb-6">
            <span className="text-4xl font-extrabold text-gray-900">₹10</span>
            <span className="text-gray-500 ml-1 mb-1 font-medium">/month</span>
          </div>

          <div className="space-y-3 mb-8">
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

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handlePayment}
              disabled={isLoading}
              className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 mr-2" />
                  Pay Securely Now
                </>
              )}
            </button>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center justify-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
          <p className="text-xs text-gray-500 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 mr-1 text-gray-400" />
            Payments are 100% secure and encrypted.
          </p>
        </div>
      </div>
    </div>
  );
}