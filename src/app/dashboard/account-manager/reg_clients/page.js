"use client";

import React, { useState } from "react";
import { CheckCircle2, Loader2, Phone, ShieldCheck, Hash, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ClaimClientPage() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccessData, setClaimSuccessData] = useState(null);

  const handleClaimClient = async () => {
    if (!mobileNumber.trim()) {
      toast.error("Please enter the registered mobile number.");
      return;
    }
    
    if (mobileNumber.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid mobile number.");
      return;
    }

    if (!referenceId.trim()) {
      toast.error("Please enter the Reference ID.");
      return;
    }

    try {
      setIsClaiming(true);
      setClaimSuccessData(null);

      const res = await fetch("/api/account-manager/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: mobileNumber.trim(),
          reqId: referenceId.trim(),
        }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success("Client verified and claimed successfully!");
        setClaimSuccessData({ accessCode: result.accessCode });
        setMobileNumber("");
        setReferenceId("");
      } else {
        toast.error(
          result.message || "Verification failed. Please check both details and try again."
        );
      }
    } catch (error) {
      toast.error("An unexpected error occurred while verifying.");
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl flex items-center justify-center min-h-[80vh]">
      <Card className="w-full shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-2xl">Verify & Claim Client</CardTitle>
          </div>
          <CardDescription>
            Enter both the client&apos;s registered mobile number and their Reference ID to securely assign them to your portfolio.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          {claimSuccessData && (
            <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-md border border-emerald-200">
              <CheckCircle2 className="h-6 w-6 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold">
                  Client successfully verified and assigned!
                </span>
                <span className="text-sm opacity-90">
                  They are now visible in your managed portfolio.
                </span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Mobile Number Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">
                Registered Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="pl-10 h-12 text-lg font-medium"
                  autoComplete="off"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleClaimClient();
                  }}
                />
              </div>
            </div>

            {/* Reference ID Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">
                Reference ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  placeholder="e.g. REG-ABCD34"
                  className="pl-10 h-12 text-lg font-mono uppercase"
                  autoComplete="off"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleClaimClient();
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            className="w-full h-12 text-base gap-2"
            onClick={handleClaimClient}
            disabled={isClaiming}
          >
            {isClaiming ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <UserPlus className="h-5 w-5" />
            )}
            {isClaiming ? "Verifying..." : "Verify Client"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}