"use client";

import { Search } from "lucide-react";

export const ClientSearch = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="relative group">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <input
        type="text"
        placeholder="Search clients..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-9 pr-4 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-slate-900 transition-all bg-white w-full md:w-64"
      />
    </div>
  );
};