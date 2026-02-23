export default function Home() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rounded-lg border bg-card p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-2">Welcome to FPL Manager AI</h2>
        <p className="text-muted-foreground mb-6">
          Your digital artificer is initializing. Soon, you'll be able to scout rivals and optimize your squad with context-aware AI strategy.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-md bg-muted/50 border">
            <h3 className="font-medium mb-1">Backend Status</h3>
            <p className="text-sm text-muted-foreground italic">Connecting to /api/py/health...</p>
          </div>
          <div className="p-4 rounded-md bg-muted/50 border">
            <h3 className="font-medium mb-1">Active GW</h3>
            <p className="text-sm text-muted-foreground italic">Scouting live data...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
