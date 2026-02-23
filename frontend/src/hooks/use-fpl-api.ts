import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api-config";

export function useFplBootstrap() {
  return useQuery({
    queryKey: ["fpl-bootstrap"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/bootstrap`);
      const result = await res.json();
      if (!result.success) throw new Error(result.error || "Failed to fetch bootstrap data");
      return result.data;
    },
  });
}

export function useBackendHealth() {
  return useQuery({
    queryKey: ["backend-health"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/health`);
      return res.json();
    },
    refetchInterval: 30000, // Check every 30s
  });
}
