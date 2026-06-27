"use client";

import { getClientCategoriesForSystem } from "@/lib/api/document";
import { useQuery } from "@tanstack/react-query";

export const useGetClientCategories = (id) => {
  return useQuery({
    queryKey: ["client-categories", id],
    queryFn: () => getClientCategoriesForSystem(id),
    enabled: !!id,
  });
};