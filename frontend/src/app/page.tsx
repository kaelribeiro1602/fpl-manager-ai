"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState<"loading" | "online" | "offline">("loading");
  const [playerCount, setPlayerCount] = useState<number | null>(null);

  useEffect(() => {
    async function checkBackend() {
      try {
        // Checking health
        const healthRes = await fetch("/api/py/health");
        const healthData = await healthRes.json();
        
        if (healthData.status === "ok") {
          setStatus("online");
          
          // Fetching bootstrap data as a test
          const bootstrapRes = await fetch("/api/py/bootstrap");
          const bootstrapData = await bootstrapRes.json();
          if (bootstrapData.success) {
            setPlayerCount(bootstrapData.data.elements.length);
          }
        } else {
          setStatus("offline");
        }
      } catch (err) {
        console.error("Failed to connect to backend:", err);
        setStatus("offline");
      }
    }

    checkBackend();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rounded-lg border bg-card p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-2">FPL AI Dashboard</h2>
        <p className="text-muted-foreground mb-6">
          Real-time status of your FPL Manager AI services.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-md bg-muted/50 border">
            <h3 className="font-medium mb-1">Backend Connection</h3>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${
                status === "loading" ? "bg-yellow-500 animate-pulse" : 
                status === "online" ? "bg-green-500" : "bg-red-500"
              }`} />
              <p className="text-sm capitalize">{status}</p>
            </div>
          </div>
          <div className="p-4 rounded-md bg-muted/50 border">
            <h3 className="font-medium mb-1">Database Sync</h3>
            <p className="text-sm text-muted-foreground">
              {playerCount ? `Loaded ${playerCount} FPL players` : "Waiting for data..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
