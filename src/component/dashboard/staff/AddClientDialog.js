"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AddClientDialog({onSuccess}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state holding all 10 fields
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    shopName: "",
    businessType: "",
    gstNumber: "",
    panNumber: "",
    address: "",
    bio: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Replace with TanStack Query useMutation trigger
      const response = await fetch("/api/staff/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create client");

      // Reset form and close dialog on success
      setFormData({
        name: "",
        mobile: "",
        email: "",
        password: "",
        shopName: "",
        businessType: "",
        gstNumber: "",
        panNumber: "",
        address: "",
        bio: "",
      });
      setOpen(false);

      onSuccess()

      // TODO: Invalidate TanStack Query here to refresh the dashboard
    } catch (error) {
      console.error(error);
      // Handle error state (e.g., show a toast notification)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add Client
        </Button>
      </DialogTrigger>

      {/* 
        max-w-2xl makes it wider to fit the 2-column grid. 
        max-h-[90vh] and overflow-y-auto ensure it scrolls nicely on small screens.
      */}
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Enter the details for the new client.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* 2-Column Grid for shorter inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number *</Label>
              <Input
                id="mobile"
                name="mobile"
                required
                value={formData.mobile}
                onChange={handleChange}
                placeholder="9876543210"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Temporary Password *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shopName">Shop / Company Name</Label>
              <Input
                id="shopName"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                placeholder="Acme Corp"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Select
                value={formData.businessType}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, businessType: value }))
                }
              >
                <SelectTrigger id="businessType">
                  <SelectValue placeholder="Select Business Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sole Proprietorship">
                    Sole Proprietorship
                  </SelectItem>
                  <SelectItem value="Partnership">Partnership Firm</SelectItem>
                  <SelectItem value="llp">
                    Limited Liability Partnership (LLP)
                  </SelectItem>
                  <SelectItem value="Private Limited">
                    Private Limited Company
                  </SelectItem>
                  <SelectItem value="Public">Public Limited Company</SelectItem>

                  <SelectItem value="trust">Trust / NGO</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gstNumber">GST Number</Label>
              <Input
                id="gstNumber"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleChange}
                placeholder="22AAAAA0000A1Z5"
                className="uppercase"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="panNumber">PAN Number</Label>
              <Input
                id="panNumber"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                placeholder="ABCDE1234F"
                className="uppercase"
              />
            </div>
          </div>

          {/* Full-width textareas for longer content */}
          <div className="space-y-2">
            <Label htmlFor="address">Registered Address</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Business Street, City, State, Zip"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Client Bio / Notes</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Any additional details about this client..."
              className="h-20"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Client"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
