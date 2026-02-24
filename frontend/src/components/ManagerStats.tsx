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
import AIRecommendations from './AIRecommendations';

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
  const [bootstrapData, setBootstrapData] = useState<any>(null);
  const [selectedGW, setSelectedGW] = useState<number | null>(null);
  const [gwDetails, setGwDetails] = useState<any>(null);
  const [gwTransfers, setGwTransfers] = useState<any[]>([]);
  const [loadingGW, setLoadingGW] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch bootstrap data on mount
  useState(() => {
    const fetchBootstrap = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const res = await fetch(`${apiUrl}/api/bootstrap`);
        if (res.ok) {
          const data = await res.json();
          const playersMap = data.elements.reduce((acc: any, el: any) => {
            acc[el.id] = el.web_name;
            return acc;
          }, {});
          setBootstrapData(playersMap);
        }
      } catch (err) {
        console.error('Failed to fetch bootstrap data', err);
      }
    };
    fetchBootstrap();
  });

  const fetchGWDetails = async (event: number) => {
    setLoadingGW(true);
    setSelectedGW(event);
    setGwDetails(null);
    setGwTransfers([]);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      
      const [picksRes, transRes] = await Promise.all([
        fetch(`${apiUrl}/api/manager/${managerId}/gameweek/${event}`),
        fetch(`${apiUrl}/api/manager/${managerId}/gameweek/${event}/transfers`)
      ]);

      if (picksRes.ok) {
        const json = await picksRes.json();
        setGwDetails(json);
      }
      if (transRes.ok) {
        const json = await transRes.json();
        setGwTransfers(json);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingGW(false);
    }
  };

  const getPlayerName = (id: number) => bootstrapData?.[id] || `Player ${id}`;

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

  // Calculate Optimal Score Data
  const optimalData = historyData?.current.map(gw => ({
    event: gw.event,
    actual: gw.points,
    bench: gw.points_on_bench,
    total_potential: gw.points + gw.points_on_bench
  }));

  const totalBenchPoints = historyData?.current.reduce((acc, curr) => acc + curr.points_on_bench, 0) || 0;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-center md:text-left">Manager Lookup</h2>
        <form onSubmit={fetchStats} className="flex flex-col sm:flex-row gap-3">
          <input
            type="number"
            value={managerId}
            onChange={(e) => setManagerId(e.target.value)}
            placeholder="Enter FPL ID"
            className="flex-1 px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 font-medium transition-colors"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
        {error && <p className="text-destructive mt-2 text-sm text-center md:text-left">{error}</p>}
      </div>

      {managerData && (
        <div className="space-y-6">
          <AIRecommendations managerId={managerId} />
          
          {/* Manager Overview Card */}
          <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-4 md:p-6 space-y-4">
            <div className="text-center md:text-left">
              <h3 className="text-lg md:text-xl font-bold">{managerData.player_first_name} {managerData.player_last_name}</h3>
              <p className="text-muted-foreground">{managerData.name}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t text-center md:text-left">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground uppercase font-medium">Overall Rank</p>
                <p className="text-xl md:text-2xl font-bold text-primary">#{managerData.summary_overall_rank?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground uppercase font-medium">Total Points</p>
                <p className="text-xl md:text-2xl font-bold">{managerData.summary_overall_points?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground uppercase font-medium">Points on Bench</p>
                <p className="text-lg md:text-xl font-semibold text-orange-500">{totalBenchPoints}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground uppercase font-medium">Region</p>
                <p className="text-lg md:text-xl font-semibold">{managerData.player_region_name}</p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          {historyData && historyData.current && (
            <div className="grid gap-6 md:grid-cols-2">
              
              {/* Rank History Chart */}
              <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-4 md:p-6">
                <h3 className="text-md md:text-lg font-semibold mb-4 text-center md:text-left">Overall Rank History</h3>
                <div className="h-[250px] md:h-[300px] w-full">
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
                        tick={{ fontSize: 10, fill: '#888' }}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        reversed 
                        tickFormatter={formatRank}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 10, fill: '#888' }}
                        width={35}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', fontSize: '12px' }}
                        formatter={(value: any) => [`#${Number(value).toLocaleString()}`, 'Rank']}
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

              {/* Optimal vs Actual Points Chart */}
              <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-4 md:p-6">
                <h3 className="text-md md:text-lg font-semibold mb-4 text-center md:text-left">Actual vs. Bench Points</h3>
                <div className="h-[250px] md:h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={optimalData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                      <XAxis 
                        dataKey="event" 
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 10, fill: '#888' }}
                      />
                      <YAxis 
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 10, fill: '#888' }}
                        width={25}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', fontSize: '12px' }}
                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2, cursor: 'pointer' }}
                        labelFormatter={(label) => `GW ${label}`}
                      />
                      <Bar 
                        dataKey="actual" 
                        stackId="a" 
                        fill="#3b82f6" 
                        name="Points Scored" 
                        onClick={(data: any) => fetchGWDetails(data.event)}
                        style={{ cursor: 'pointer' }}
                      />
                      <Bar 
                        dataKey="bench" 
                        stackId="a" 
                        fill="#f97316" 
                        name="Left on Bench" 
                        radius={[4, 4, 0, 0]} 
                        onClick={(data: any) => fetchGWDetails(data.event)}
                        style={{ cursor: 'pointer' }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* GW Details Modal/Section */}
              {selectedGW && (
                <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-4 md:p-6 md:col-span-2 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Gameweek {selectedGW} Details</h3>
                    <button 
                      onClick={() => setSelectedGW(null)}
                      className="text-muted-foreground hover:text-foreground p-1 text-xs"
                    >
                      ✕ Close
                    </button>
                  </div>
                  
                  {loadingGW ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : gwDetails ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-lg">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase">Transfers</p>
                          <p className="font-bold text-sm md:text-base">{gwDetails.active_chip === 'wildcard' ? 'Wildcard' : gwDetails.entry_history.event_transfers}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase">Transfer Cost</p>
                          <p className="font-bold text-red-500 text-sm md:text-base">-{gwDetails.entry_history.event_transfers_cost}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase">GW Rank</p>
                          <p className="font-bold text-sm md:text-base">#{gwDetails.entry_history.rank.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase">Chip Active</p>
                          <p className="font-bold capitalize text-sm md:text-base">{gwDetails.active_chip || 'None'}</p>
                        </div>
                      </div>

                      {gwTransfers.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-semibold border-b pb-1">Transfers Made</p>
                          <div className="grid gap-2">
                            {gwTransfers.map((t: any, i: number) => (
                              <div key={i} className="flex flex-wrap items-center justify-between text-xs md:text-sm bg-muted/20 p-2 rounded">
                                <div className="flex items-center gap-2">
                                  <span className="text-red-500 font-medium">OUT: {getPlayerName(t.element_out)}</span>
                                  <span className="text-muted-foreground">→</span>
                                  <span className="text-green-500 font-medium">IN: {getPlayerName(t.element_in)}</span>
                                </div>
                                <span className="text-muted-foreground">£{(t.element_in_cost / 10).toFixed(1)}m</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid gap-4">
                         <p className="text-sm font-semibold border-b pb-1">Starting XI</p>
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {gwDetails.picks.map((pick: any) => (
                              <div 
                                key={pick.element} 
                                className={`flex justify-between p-2 rounded border text-sm ${pick.position <= 11 ? 'bg-background' : 'bg-orange-500/10 border-orange-500/20'}`}
                              >
                                <span>
                                  {pick.is_captain && <span className="text-primary font-bold mr-1">©</span>}
                                  {pick.is_vice_captain && <span className="text-muted-foreground font-bold mr-1">Ⓥ</span>}
                                  {getPlayerName(pick.element)}
                                </span>
                                <span className="text-muted-foreground text-[10px]">Pos: {pick.position}</span>
                              </div>
                            ))}
                         </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">Select a gameweek to see your team.</p>
                  )}
                </div>
              )}

              {/* Team Value Chart */}
              <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-4 md:p-6 md:col-span-2">
                <h3 className="text-md md:text-lg font-semibold mb-4 text-center md:text-left">Team Value Progression (£m)</h3>
                <div className="h-[200px] md:h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historyData.current}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                      <XAxis 
                        dataKey="event" 
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 10, fill: '#888' }}
                      />
                      <YAxis 
                        domain={['auto', 'auto']}
                        tickFormatter={(val) => `£${(val/10).toFixed(1)}`}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 10, fill: '#888' }}
                        width={40}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', fontSize: '12px' }}
                        formatter={(value: any) => [`£${(Number(value) / 10).toFixed(1)}m`, 'Value']}
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
              <div className="p-4 md:p-6 border-b">
                 <h3 className="text-md md:text-lg font-semibold text-center md:text-left">Season History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted text-muted-foreground text-xs uppercase">
                    <tr>
                      <th className="px-4 md:px-6 py-3">Season</th>
                      <th className="px-4 md:px-6 py-3">Points</th>
                      <th className="px-4 md:px-6 py-3">Rank</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {historyData.past.map((season) => (
                      <tr key={season.season_name} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 md:px-6 py-4 font-medium whitespace-nowrap">{season.season_name}</td>
                        <td className="px-4 md:px-6 py-4">{season.total_points}</td>
                        <td className="px-4 md:px-6 py-4">#{season.rank.toLocaleString()}</td>
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
