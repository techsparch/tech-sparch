import { getDocumentsByCategoryForAccountManager } from "@/lib/api/document";
import { useQuery } from "@tanstack/react-query";

export const useDocumentsForAccountManager = (clientId, categoryId) => {
  return useQuery({
    queryKey: ["documents", clientId, categoryId],
    queryFn: () =>getDocumentsByCategoryForAccountManager(clientId, categoryId),
    enabled: !!clientId && !!categoryId,
  });
};