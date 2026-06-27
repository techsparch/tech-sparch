"use client";

import { getCategoryDocuments } from "@/lib/api/document";
import { useQuery } from "@tanstack/react-query";

export function useCategoryDocuments(categoryId) {
  return useQuery({
    queryKey: ["documents", categoryId],
    queryFn: () => getCategoryDocuments(categoryId),

    enabled: !!categoryId,

    staleTime: 1000 * 60 * 5,
  });
}