import { fetchStaffClients } from "@/lib/api/document";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
// Import your updated fetch function

export const useStaffClients = (page = 1, limit = 30, search = "") => {
  return useQuery({
    // Adding `search` here is mandatory for the search bar to work!
    queryKey: ["staff-clients", page, limit, search],
    
    queryFn: () => fetchStaffClients({ page, limit, search }),
    
    // This prevents the screen from flashing blank while searching
    placeholderData: keepPreviousData,
    
    staleTime: 5 * 60 * 1000, 
  });
};