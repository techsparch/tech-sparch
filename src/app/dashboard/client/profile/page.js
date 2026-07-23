"use client";

import React, { useState } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Save, 
  Loader2,
  Store,
  Briefcase,
  FileText,
  CreditCard,
  Hash,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function ClientProfile() {
  const { data: session } = useSession();
  const [isSaving, setIsSaving] = useState(false);

  // Initialize with your exact data structure
  const [formData, setFormData] = useState({
    name: "testing live",
    email: "chaitanyasatarkar123@gmail.com",
    mobile: "9137452737",
    altMobile: "",
    shopName: "",
    businessType: "",
    gstNumber: "",
    panNumber: "",
    address: "",
    bio: "",
  });

  // Read-only system data
  const systemData = {
    role: "client",
    isActive: true,
    accessCode: "TS-LTRR",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // TODO: Add your fetch logic to send formData to backend
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 space-y-8 min-h-screen text-light">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-dark tracking-tighter">
          Client Profile
        </h1>
        <p className="text-sm font-semibold text-dark/50 mt-1">
          Manage your personal information, business details, and billing data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN - Avatar & Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-dark border   rounded-2xl p-6 flex flex-col items-center text-center shadow-lg">
            
            {/* Avatar */}
            <div className="relative group cursor-pointer mb-4">
              <div className="h-28 w-28 rounded-full bg-blue-600 border-4  flex items-center justify-center text-light text-3xl font-bold shadow-inner transition-transform group-hover:scale-105 uppercase">
                {formData.name ? formData.name.charAt(0) : "C"}
              </div>
              <div className="absolute bottom-0 right-0 p-2 bg-light border-2  rounded-full text-slate-300 group-hover:text-white transition-colors">
                <Camera className="h-4 w-4 text-dark"  />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-light uppercase">
              {formData.name || "Client Name"}
            </h2>
            
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                {systemData.role}
              </span>
              {systemData.isActive && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Active
                </span>
              )}
            </div>
          </div>

          {/* Quick Details Card */}
          <div className="bg-dark border  rounded-2xl p-6 space-y-5 shadow-lg">
            <h3 className="text-sm font-semibold text-light uppercase tracking-wider mb-2 border-b  pb-3">
              Account Overview
            </h3>
            
            <div className="flex items-center gap-3 text-sm font-semibold">
              <Hash className="h-4 w-4 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-slate-500 text-xs">Access Code</span>
                <span className="text-white">{systemData.accessCode}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm font-semibold">
              <Mail className="h-4 w-4 text-slate-400" />
              <div className="flex flex-col overflow-hidden">
                <span className="text-slate-500 text-xs">Email</span>
                <span className="text-white truncate">{formData.email}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-sm font-semibold">
              <Phone className="h-4 w-4 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-slate-500 text-xs">Mobile</span>
                <span className="text-white">{formData.mobile}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Edit Form */}
        <div className="lg:col-span-2">
          <div className="bg-dark border  rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b ">
              <h2 className="text-2xl font-semibold text-light tracking-wide ">Edit Profile Details</h2>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-8">
              
              {/* SECTION 1: Personal Info */}
              <div className="space-y-4">
                <h3 className="text-md font-semibold text-light-600 uppercase tracking-wider mb-4 border-b ">
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-light/400 font-semibold text-sm">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-dark" />
                      <Input 
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="pl-10 bg-light  text-dark font-semibold focus-visible:ring-dark h-11 rounded-lg" 
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-light font-semibold text-sm">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-dark" />
                      <Input 
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10 bg-light  text-dark font-semibold focus-visible:ring-blue-500 h-11 rounded-xl" 
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobile" className="text-light font-semibold text-sm">Mobile Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-dark" />
                      <Input 
                        id="mobile"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        className="pl-10 bg-light  text-dark font-semibold focus-visible:ring-blue-500 h-11 rounded-xl" 
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="altMobile" className="text-light font-semibold text-sm">Alternate Mobile</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-dark" />
                      <Input 
                        id="altMobile"
                        name="altMobile"
                        value={formData.altMobile}
                        onChange={handleChange}
                        placeholder="Optional"
                        className="pl-10 bg-light  text-dark font-semibold focus-visible:ring-blue-500 h-11 rounded-xl placeholder:text-slate-600" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Business Info */}
              <div className="space-y-4">
                <h3 className="text-md font-semibold text-light uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
                  Business Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="shopName" className="text-light font-semibold text-sm">Shop / Company Name</Label>
                    <div className="relative">
                      <Store className="absolute left-3 top-3 h-4 w-4 text-dark" />
                      <Input 
                        id="shopName"
                        name="shopName"
                        value={formData.shopName}
                        onChange={handleChange}
                        placeholder="Enter business name"
                        className="pl-10 bg-light  text-dark font-semibold focus-visible:ring-blue-500 h-11 rounded-xl placeholder:text-slate-600" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessType" className="text-light font-semibold text-sm">Business Type</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 h-4 w-4 text-dark" />
                      <Input 
                        id="businessType"
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleChange}
                        placeholder="e.g. Retail, Services, Manufacturing"
                        className="pl-10 bg-light  text-dark font-semibold focus-visible:ring-blue-500 h-11 rounded-xl placeholder:text-slate-600" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gstNumber" className="text-light font-semibold text-sm">GST Number</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-dark" />
                      <Input 
                        id="gstNumber"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleChange}
                        placeholder="Enter 15-digit GSTIN"
                        className="pl-10 bg-light  text-dark font-semibold focus-visible:ring-blue-500 h-11 rounded-xl uppercase placeholder:text-slate-600 placeholder:normal-case" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="panNumber" className="text-light font-semibold text-sm">PAN Number</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3 h-4 w-4 text-dark" />
                      <Input 
                        id="panNumber"
                        name="panNumber"
                        value={formData.panNumber}
                        onChange={handleChange}
                        placeholder="Enter 10-digit PAN"
                        className="pl-10 bg-light  text-dark font-semibold focus-visible:ring-blue-500 h-11 rounded-xl uppercase placeholder:text-slate-600 placeholder:normal-case" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Additional Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
                  Additional Details
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-slate-300 font-semibold text-sm">Complete Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input 
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Street, City, State, ZIP"
                      className="pl-10 bg-slate-950 border-slate-800 text-white font-semibold focus-visible:ring-blue-500 h-11 rounded-xl placeholder:text-slate-600" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-slate-300 font-semibold text-sm">Bio / Notes</Label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell us a bit about your business..."
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-600 resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-4 border-t border-slate-800 mt-8">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="h-11 px-6 rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white font-semibold"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Profile
                    </>
                  )}
                </Button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}