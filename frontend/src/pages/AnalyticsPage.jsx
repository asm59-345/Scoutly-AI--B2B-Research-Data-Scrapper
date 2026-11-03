import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Mail, 
  Phone, 
  ShieldCheck, 
  RefreshCw, 
  MapPin, 
  Layers, 
  Calendar,
  Building2
} from 'lucide-react';

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState(null);
  const [industryDist, setIndustryDist] = useState([]);
  const [locationDist, setLocationDist] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const [resOverview, resInd, resLoc, resHist] = await Promise.all([
        fetch('/api/v1/analytics/overview'),
        fetch('/api/v1/analytics/leads-by-industry'),
        fetch('/api/v1/analytics/leads-by-location'),
        fetch('/api/v1/search-history')
      ]);

      if (resOverview.ok) setMetrics(await resOverview.json());
      if (resInd.ok) setIndustryDist(await resInd.json());
      if (resLoc.ok) setLocationDist(await resLoc.json());
      if (resHist.ok) setSearchHistory(await resHist.json());
    } catch (e) {
      console.error("Analytics fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8 py-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Prospecting Intelligence & Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Aggregated metrics derived strictly from your persistent SQLite database records.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-1.5 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-indigo-500" : ""}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Leads Discovered",
            val: metrics?.total_leads_discovered ?? "...",
            sub: `${metrics?.total_searches_executed ?? 0} searches executed`,
            icon: Users,
            color: "text-indigo-600 dark:text-indigo-400"
          },
          {
            label: "Email Discovery Rate",
            val: metrics?.email_penetration_rate ?? "0.0%",
            sub: `${metrics?.leads_with_email ?? 0} verified corporate emails`,
            icon: Mail,
            color: "text-emerald-600 dark:text-emerald-400"
          },
          {
            label: "Telephone Coverage",
            val: metrics?.leads_with_phone ? `${metrics.leads_with_phone} lines` : "0 lines",
            sub: "Direct reachable contacts",
            icon: Phone,
            color: "text-violet-600 dark:text-violet-400"
          },
          {
            label: "Decision Maker Rate",
            val: metrics?.decision_maker_rate ?? "0.0%",
            sub: `${metrics?.leads_with_decision_maker ?? 0} executive names`,
            icon: ShieldCheck,
            color: "text-amber-600 dark:text-amber-400"
          }
        ].map((card, i) => (
          <div key={i} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#111726] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{card.label}</span>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <div className="mt-3">
              <div className={`text-2xl font-black ${card.color}`}>{card.val}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Distribution Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Industry Distribution */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#111726] shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Layers className="w-4 h-4 text-indigo-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Leads by Category Vertical
            </h3>
          </div>

          {industryDist.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No vertical distribution data available yet. Run a prospecting job to populate.
            </div>
          ) : (
            <div className="space-y-3">
              {industryDist.map((item, idx) => {
                const max = industryDist[0]?.count || 1;
                const pct = Math.round((item.count / max) * 100);

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700 dark:text-slate-300 truncate max-w-[240px]">{item.category}</span>
                      <span className="font-mono text-slate-500 font-semibold">{item.count} leads</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Geographic Distribution */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#111726] shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <MapPin className="w-4 h-4 text-rose-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Leads by Geographic Market
            </h3>
          </div>

          {locationDist.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No location data available yet.
            </div>
          ) : (
            <div className="space-y-3">
              {locationDist.map((item, idx) => {
                const max = locationDist[0]?.count || 1;
                const pct = Math.round((item.count / max) * 100);

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700 dark:text-slate-300 truncate">{item.city}</span>
                      <span className="font-mono text-slate-500 font-semibold">{item.count} leads</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-rose-500 dark:bg-rose-400 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Historical Query Execution Table */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#111726] shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Calendar className="w-4 h-4 text-indigo-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Historical Prospecting Runs
          </h3>
        </div>

        {searchHistory.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No past research queries recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-900 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Job ID</th>
                  <th className="p-3">Target Market</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Execution Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {searchHistory.map((job, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-semibold text-slate-900 dark:text-white">{job.job_id}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">
                      {job.city}, {job.state ? `${job.state}, ` : ""}{job.country}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        job.status === "Completed" ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400" :
                        job.status === "Running" ? "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 animate-pulse" :
                        "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-400 text-[11px]">
                      {job.created_at ? new Date(job.created_at).toLocaleString() : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

