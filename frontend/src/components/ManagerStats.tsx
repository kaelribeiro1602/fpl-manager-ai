'use client';

import { useState } from 'react';

interface Manager {
  id: number;
  player_first_name: string;
  player_last_name: string;
  player_region_name: string;
  summary_overall_points: number;
  summary_overall_rank: number;
  summary_event_points: number;
  summary_event_rank: number;
  current_event: number;
  leagues: {
    classic: {
        id: number;
        name: string;
        rank: number;
        entry_rank: number;
    }[];
  };
  name: string; // Team name
}

interface History {
  current: {
    event: number;
    points: number;
    total_points: number;
    rank: number;
    rank_sort: number;
    overall_rank: number;
    bank: number;
    value: number;
    event_transfers: number;
    event_transfers_cost: number;
    points_on_bench: number;
  }[];
  past: {
    season_name: string;
    total_points: number;
    rank: number;
  }[];
}

export default function ManagerStats() {
  const [managerId, setManagerId] = useState('');
  const [managerData, setManagerData] = useState<Manager | null>(null);
  const [historyData, setHistoryData] = useState<History | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStats = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setManagerData(null);
    setHistoryData(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      
      // Fetch Manager Details
      const managerRes = await fetch(`${apiUrl}/api/manager/${managerId}`);
      if (!managerRes.ok) throw new Error('Manager not found');
      const managerJson = await managerRes.json();
      setManagerData(managerJson);

      // Fetch History
      const historyRes = await fetch(`${apiUrl}/api/manager/${managerId}/history`);
      if (historyRes.ok) {
        const historyJson = await historyRes.json();
        setHistoryData(historyJson);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-4">Manager Lookup</h2>
        <form onSubmit={fetchStats} className="flex gap-4">
          <input
            type="number"
            value={managerId}
            onChange={(e) => setManagerId(e.target.value)}
            placeholder="Enter FPL ID (e.g. 123456)"
            className="flex-1 px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 font-medium transition-colors"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
        {error && <p className="text-destructive mt-2 text-sm">{error}</p>}
      </div>

      {managerData && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Manager Overview Card */}
          <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-xl font-bold">{managerData.player_first_name} {managerData.player_last_name}</h3>
              <p className="text-muted-foreground">{managerData.name}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Overall Rank</p>
                <p className="text-2xl font-bold text-primary">#{managerData.summary_overall_rank?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-2xl font-bold">{managerData.summary_overall_points?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">GW Points</p>
                <p className="text-lg font-semibold">{managerData.summary_event_points}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Region</p>
                <p className="text-lg font-semibold">{managerData.player_region_name}</p>
              </div>
            </div>
          </div>

          {/* Current Season Trend */}
          {historyData && historyData.current && (
             <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Current Season Performance</h3>
                <div className="space-y-3">
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Team Value</span>
                      <span className="font-mono">£{(historyData.current[historyData.current.length - 1].value / 10).toFixed(1)}m</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Bank</span>
                      <span className="font-mono">£{(historyData.current[historyData.current.length - 1].bank / 10).toFixed(1)}m</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Total Transfers</span>
                      <span className="font-mono">{historyData.current.reduce((acc, gw) => acc + gw.event_transfers, 0)}</span>
                   </div>
                </div>
             </div>
          )}
        </div>
      )}

      {/* History Table */}
      {historyData && historyData.past && historyData.past.length > 0 && (
        <div className="bg-card text-card-foreground rounded-lg border shadow-sm overflow-hidden">
          <div className="p-6 border-b">
             <h3 className="text-lg font-semibold">Season History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="px-6 py-3">Season</th>
                  <th className="px-6 py-3">Points</th>
                  <th className="px-6 py-3">Rank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {historyData.past.map((season) => (
                  <tr key={season.season_name} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{season.season_name}</td>
                    <td className="px-6 py-4">{season.total_points}</td>
                    <td className="px-6 py-4">#{season.rank.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
