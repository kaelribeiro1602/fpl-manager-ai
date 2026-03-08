"use client";

import { useBackendHealth, useFplBootstrap } from "@/hooks/use-fpl-api";
import ManagerStats from "@/components/ManagerStats";

export default function Home() {
  const { data: health, isLoading: isHealthLoading, isError: isHealthError } = useBackendHealth();
  const { data: bootstrap, isLoading: isBootstrapLoading } = useFplBootstrap();

  const status = isHealthLoading ? "loading" : (health?.status === "ok" ? "online" : "offline");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rounded-lg border bg-card p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-2">FPL AI Dashboard</h2>
        <p className="text-muted-foreground mb-6">
          Real-time status of your FPL Manager AI services using TanStack Query.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-md bg-muted/50 border">
            <h3 className="font-medium mb-1">Backend Connection</h3>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${
                status === "loading" ? "bg-primary animate-pulse" : 
                status === "online" ? "bg-green-500" : "bg-red-500"
              }`} />
              <p className="text-sm capitalize">{status}</p>
            </div>
          </div>
          <div className="p-4 rounded-md bg-muted/50 border">
            <h3 className="font-medium mb-1">Database Sync</h3>
            <p className="text-sm text-muted-foreground">
              {isBootstrapLoading ? "Loading FPL players..." : 
               bootstrap?.elements ? `Loaded ${bootstrap.elements.length} FPL players` : 
               "Waiting for data..."}
            </p>
          </div>
        </div>
      </div>

      <ManagerStats />
    </div>
  );
}
