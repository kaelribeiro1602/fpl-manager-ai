'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts';

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

  // Helper to format large numbers
  const formatRank = (rank: number) => {
    if (rank >= 1000000) return `${(rank / 1000000).toFixed(1)}M`;
    if (rank >= 1000) return `${(rank / 1000).toFixed(0)}k`;
    return rank.toString();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
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
        <div className="space-y-6">
          {/* Manager Overview Card */}
          <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-xl font-bold">{managerData.player_first_name} {managerData.player_last_name}</h3>
              <p className="text-muted-foreground">{managerData.name}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
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

          {/* Charts Section */}
          {historyData && historyData.current && (
            <div className="grid gap-6 md:grid-cols-2">
              
              {/* Rank History Chart */}
              <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Overall Rank History</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historyData.current}>
                      <defs>
                        <linearGradient id="colorRank" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                      <XAxis 
                        dataKey="event" 
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12, fill: '#888' }}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        reversed 
                        tickFormatter={formatRank}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12, fill: '#888' }}
                        width={40}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                        formatter={(value: number) => [`#${value.toLocaleString()}`, 'Rank']}
                        labelFormatter={(label) => `GW ${label}`}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="overall_rank" 
                        stroke="#22c55e" 
                        fillOpacity={1} 
                        fill="url(#colorRank)" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Points per GW Chart */}
              <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Gameweek Points</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={historyData.current}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                      <XAxis 
                        dataKey="event" 
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12, fill: '#888' }}
                      />
                      <YAxis 
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12, fill: '#888' }}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
                        labelFormatter={(label) => `GW ${label}`}
                      />
                      <Bar dataKey="points" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Team Value Chart */}
              <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6 md:col-span-2">
                <h3 className="text-lg font-semibold mb-4">Team Value Progression (£m)</h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historyData.current}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                      <XAxis 
                        dataKey="event" 
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12, fill: '#888' }}
                      />
                      <YAxis 
                        domain={['auto', 'auto']}
                        tickFormatter={(val) => `£${(val/10).toFixed(1)}`}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12, fill: '#888' }}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                        formatter={(value: number) => [`£${(value / 10).toFixed(1)}m`, 'Value']}
                        labelFormatter={(label) => `GW ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#a855f7" 
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

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
      )}
    </div>
  );
}
