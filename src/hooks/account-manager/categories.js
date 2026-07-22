"use client";


import { getClientCategoriesForAccountManager } from "@/lib/api/document";
import { useQuery } from "@tanstack/react-query";

// 1. Accept the page argument
export const useGetClientCategoriesForAccountManager = (id, page = 1) => {
  return useQuery({
    // 2. CRITICAL: Add `page` to the queryKey so it refetches when the page changes
    queryKey: ["client-categories", id, page], 
    
    // 3. Pass the page down to your fetch function
    queryFn: () => getClientCategoriesForAccountManager(id, page), 
    
    enabled: !!id,
  });
};