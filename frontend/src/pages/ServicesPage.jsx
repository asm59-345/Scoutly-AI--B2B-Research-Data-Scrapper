import React from 'react';
import { 
  Sparkles, 
  Search, 
  Globe, 
  FileSpreadsheet, 
  BarChart3, 
  Layers, 
  ArrowRight,
  Check
} from 'lucide-react';

export default function ServicesPage({ onLaunchWorkspace }) {
  const services = [
    {
      icon: Sparkles,
      title: "1. AI Business Discovery",
      desc: "Convert high-level business goals into structured, validated search intent mapped to master industry verticals.",
      capabilities: [
        "Natural language prompt parsing",
        "Deterministic category & sub-sector matching",
        "Target geographic entity resolution (City, State, Country)",
        "Prompt confidence and grounding scoring"
      ],
      status: "Available"
    },
    {
      icon: Search,
      title: "2. B2B Lead Generation",
      desc: "Autonomous browser discovery pipeline scraping active physical commercial listings with zero manual copying.",
      capabilities: [
        "Headless Chrome automated search execution",
        "Multi-category query chaining",
        "Infinite feed scroll & unique link extraction",
        "Duplicate business profile filtration"
      ],
      status: "Available"
    },
    {
      icon: Globe,
      title: "3. Business Data Extraction",
      desc: "Capture rich firmographic and localized presence signals directly from commercial profiles.",
      capabilities: [
        "Full commercial name & legal title capture",
        "Primary telephone number indexing",
        "Verified physical street & district addresses",
        "Direct domain & website authority parsing"
      ],
      status: "Available"
    },
    {
      icon: Layers,
      title: "4. Deep Lead Enrichment",
      desc: "Automated sub-page crawling across company websites to uncover key decision makers and corporate emails.",
      capabilities: [
        "Heuristic crawling of /contact, /about, /team pages",
        "Regex-based corporate email parsing with priority weighting",
        "Executive title pattern recognition (CEO, Founder, Director)",
        "SSRF-safe outbound HTTP requests"
      ],
      status: "Available"
    },
    {
      icon: BarChart3,
      title: "5. Market Research & Analytics",
      desc: "Comprehensive aggregations and density metrics across discovered leads, categories, and target cities.",
      capabilities: [
        "Real-time pipeline run analytics",
        "Email penetration & decision-maker discovery rates",
        "Category distribution breakdowns",
        "Historical research query tracking"
      ],
      status: "Available"
    },
    {
      icon: FileSpreadsheet,
      title: "6. Lead Management & Export",
      desc: "Durable SQLite storage, inline qualification scoring, notes management, and sanitized downloads.",
      capabilities: [
        "Durable lead persistence across restarts",
        "CWE-1236 formula-injection-safe CSV export",
        "Times New Roman corporate-styled Excel (.xlsx) workbooks",
        "One-click clipboard copying & lead tagging"
      ],
      status: "Available"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 space-y-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Platform Solutions
        </span>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Comprehensive Lead Intelligence Services
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Every tool you need to research markets, identify high-probability prospects, and extract verified contact points without manual friction.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((svc, idx) => (
          <div key={idx} className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111726] shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <svc.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  {svc.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{svc.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{svc.desc}</p>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Key Capabilities</span>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {svc.capabilities.map((c, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    <span className="text-[11px]">{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={onLaunchWorkspace}
              className="w-full py-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-200 hover:text-indigo-600 rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-1"
            >
              <span>Use in Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}

