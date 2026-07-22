import { getDocumentsByCategoryForStaff } from "@/lib/api/document";
import { useQuery } from "@tanstack/react-query";

export const useDocumentsForStaff = (clientId, categoryId) => {
  return useQuery({
    queryKey: ["documents for Staff", clientId, categoryId],
    queryFn: () => getDocumentsByCategoryForStaff(clientId, categoryId),
    enabled: !!clientId && !!categoryId,
  });
};
