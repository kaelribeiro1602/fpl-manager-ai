import { useQuery } from "@tanstack/react-query";

export function useFplBootstrap() {
  return useQuery({
    queryKey: ["fpl-bootstrap"],
    queryFn: async () => {
      const res = await fetch("/api/py/bootstrap");
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
      const res = await fetch("/api/py/health");
      return res.json();
    },
    refetchInterval: 30000, // Check every 30s
  });
}
