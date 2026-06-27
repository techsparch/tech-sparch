import { getDocumentsByCategory } from "@/lib/api/document";
import { useQuery } from "@tanstack/react-query";

export const useDocuments = (clientId, categoryId) => {
  return useQuery({
    queryKey: ["documents", clientId, categoryId],
    queryFn: () => getDocumentsByCategory(clientId, categoryId),
    enabled: !!clientId && !!categoryId,
  });
};
