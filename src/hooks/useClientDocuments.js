import { useQuery } from "@tanstack/react-query";

export const useClientDocuments = (id, page = 1) => {
  return useQuery({
    queryKey: ["client-documents", id, page],
    queryFn: async () => {
      const res = await fetch(
        `/api/system/getUserDetails/${id}?page=${page}&limit=10`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch");
      }

      return res.json();
    },
    enabled: !!id,
  });
};