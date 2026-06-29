"use client"
import { fetchDataForAccountManager } from "@/lib/api/document";
import { useQuery } from "@tanstack/react-query";

export const useAccountManagerDashboard = (id) => {
  return useQuery({
    queryKey: ["account-manager-dashboard", id],
    queryFn: fetchDataForAccountManager,
    staleTime: 1000 * 60 * 5,
  });
};
