"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import Script from "next/script"; // Use Next.js Script component to load external scripts

const Testing = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const { data: session } = useSession();

  const handleCreateSubscription = async () => {
    // Prevent execution if script isn't loaded yet
    if (!scriptLoaded) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    try {
      setLoading(true);

      // 1. Create Subscription
      const res = await fetch("/api/subscription/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        setLoading(false);
        return;
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: data.key,
        subscription_id: data.subscriptionId,
        name: "SP Consultancy",
        description: "Monthly Subscription",
        prefill: {
          name: session?.user?.name,
          email: session?.user?.email,
          contact: session?.user?.mobile,
        },
        theme: {
          color: "#2563eb",
        },
        handler: async function (checkoutResponse) {
          console.log("Payment Success locally. Verifying with backend...");
          
          try {
            // 3. Verify Payment Signature
            const verifyRes = await fetch("/api/subscription/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_payment_id: checkoutResponse.razorpay_payment_id,
                razorpay_subscription_id: checkoutResponse.razorpay_subscription_id,
                razorpay_signature: checkoutResponse.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              setResponse({ status: "Success", ...verifyData });
              alert("Payment Verified! Your subscription is now setting up.");
              // The webhook will handle the actual activation in the background
            } else {
              setResponse({ status: "Failed Verification", ...verifyData });
              alert(verifyData.message || "Payment verification failed.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("Error verifying payment.");
          }
        },
        modal: {
          ondismiss() {
            console.log("Checkout Closed by User");
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (failedResponse) {
        console.error("Payment Failed:", failedResponse.error.description);
        alert(failedResponse.error.description);
        setLoading(false);
      });

      razorpay.open();
    } catch (error) {
      console.error(error);
      setResponse({
        message: "Something went wrong.",
      });
      setLoading(false);
    }
  };

  return (
    <div className="p-10">
      {/* Load Razorpay script asynchronously */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setScriptLoaded(true)}
      />

      <button
        onClick={handleCreateSubscription}
        disabled={loading || !scriptLoaded}
        className="bg-blue-600 text-white px-5 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Processing..." : "Create Subscription"}
      </button>

      {response && (
        <pre className="mt-5 bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default Testing;