"use client";

import React, { useState } from "react";
import { Search, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

function getInitials(name) {
  if (!name || typeof name !== "string") return "?";

  const cleanName = name.trim();
  if (!cleanName) return "?";

  const parts = cleanName.split(/\s+/);

  // FIXED: Added [0] to select the first word before using charAt()
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  // FIXED: Added [0] here as well
  const first = parts[0].charAt(0);
  const last = parts[parts.length - 1].charAt(0);

  return (first + last).toUpperCase();
}

export default function SearchUser({ 
  searchTerm, 
  onSearchChange, 
  users = [], 
  isLoading = false,
  onUserSelect // NEW PROP ADDED HERE
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleInputChange = (e) => {
    onSearchChange(e.target.value);
    setIsOpen(true);
  };

  const handleClearSearch = () => {
    onSearchChange("");
    setIsOpen(false);
  };

  const handleCloseDrawer = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-md">
      {/* 1. THE SEARCH INPUT */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search for a user..."
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => { if (searchTerm) setIsOpen(true); }} 
          className="pl-9 pr-10 bg-white"
        />
        
        {isLoading ? (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />
        ) : (
          searchTerm.length > 0 && (
            <button 
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )
        )}
      </div>

      {/* 2. THE DROPDOWN RESULTS */}
      {isOpen && searchTerm.trim().length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50 max-h-80 overflow-y-auto flex flex-col">
          
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Search Results
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-slate-500 hover:text-slate-900"
              onClick={handleCloseDrawer} 
            >
              Close
            </Button>
          </div>

          {isLoading && users.length === 0 && (
            <div className="p-4 text-sm text-center text-slate-500">Searching...</div>
          )}

          {!isLoading && users.length === 0 && (
            <div className="p-4 text-sm text-center text-slate-500">
              No users found for &quot;{searchTerm}&quot;
            </div>
          )}

          {!isLoading && users.length > 0 && (
            <div className="py-2">
              {users.map((user) => (
                <div 
                  key={user._id} 
                  // UPDATED: Added onClick to trigger the selection and close drawer
                  onClick={() => {
                    if (onUserSelect) onUserSelect(user);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.imageUrl} />
                    <AvatarFallback className="bg-blue-50 text-blue-700 text-xs">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium text-slate-900 truncate capitalize">
                      {user.name}
                    </span>
                    <span className="text-xs text-slate-500 truncate">
                      {user.email || user.mobile}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}