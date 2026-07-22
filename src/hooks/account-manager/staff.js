"use client";

import { getStaffForAccountManager } from "@/lib/api/document";
import { useQuery } from "@tanstack/react-query";

export const useGetStaffForAccountManager = (page = 1) => {
  return useQuery({
    // 2. CRITICAL: Add `page` to the queryKey so it refetches when the page changes
    queryKey: ["staff", page],

    // 3. Pass the page down to your fetch function
    queryFn: () => getStaffForAccountManager( page),
  });
};