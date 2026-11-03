import React from 'react';
import { 
  Sparkles, 
  Search, 
  SlidersHorizontal, 
  Play, 
  CheckCircle, 
  Download,
  ArrowRight
} from 'lucide-react';

export default function HowItWorksPage({ onLaunchWorkspace }) {
  const steps = [
    {
      num: "01",
      icon: Sparkles,
      title: "Step 1: Enter Your Business Requirements",
      desc: "Begin with a plain-English prompt or select directly from our Master Taxonomy.",
      example: "Find independent automotive service businesses in Lucknow and identify publicly listed company contact details.",
      detail: "Scoutly AI accepts conversational descriptions, identifying both the target commercial activity and geographic bounds."
    },
    {
      num: "02",
      icon: Search,
      title: "Step 2: AI Intent Parsing & Taxonomy Mapping",
      desc: "Your unstructured prompt is evaluated by our deterministic parser.",
      example: "Parsed Output -> Category: Automotive (Car Dealerships, Auto Repair Shops) | Location: Lucknow, UP, India.",
      detail: "We match tokens strictly against our 11 industry verticals without generating imaginary classifications."
    },
    {
      num: "03",
      icon: SlidersHorizontal,
      title: "Step 3: Fine-Tune Geographic Scope & Options",
      desc: "Customize research boundaries, results count, and browser modes before firing the crawler.",
      example: "City: Lucknow | Limit: 20 per sub-sector | Mode: Silent Headless",
      detail: "Review and edit pre-populated cities, states, and sub-category checklists directly in the Workspace interface."
    },
    {
      num: "04",
      icon: Play,
      title: "Step 4: Launch Real-Time Prospecting Pipeline",
      desc: "The autonomous browser automation starts harvesting listings from Google Maps.",
      example: "Worker spawns -> Navigates to feeds -> Extracts business titles, addresses, phones, and websites.",
      detail: "Watch progress stream into the live console with real-time logs and active elapsed timer."
    },
    {
      num: "05",
      icon: CheckCircle,
      title: "Step 5: Deep Website Enrichment & Contact Parsing",
      desc: "For every business with an active URL, our SSRF-safe crawler visits sub-pages.",
      example: "Visits /contact and /about -> Prioritizes emails (ceo@, info@) -> Matches executive names (Founders, MDs).",
      detail: "Identified data is assigned a 100-point transparent quality score based on verified signals."
    },
    {
      num: "06",
      icon: Download,
      title: "Step 6: Review, Draft Pitch & Export Clean Data",
      desc: "Manage leads inside the table, generate cold email pitches, and export.",
      example: "Generate 1-click sales draft -> Export formula-injection-safe CSV or styled Excel file.",
      detail: "All records are automatically persisted in your local SQLite store for durable review."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 space-y-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Step-by-Step Guide
        </span>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          How Scoutly AI Works
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Follow the end-to-end journey from initial natural-language prompt to verified, enriched leads in your CRM or spreadsheet.
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-6">
        {steps.map((st, i) => (
          <div key={i} className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111726] shadow-sm flex flex-col md:flex-row items-start gap-5">
            <div className="flex items-center space-x-3 shrink-0">
              <span className="font-mono text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {st.num}
              </span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <st.icon className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2 flex-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{st.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{st.desc}</p>
              
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300">
                {st.example}
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed pt-1">{st.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Launch CTA */}
      <div className="p-8 rounded-2xl bg-indigo-600 text-white text-center space-y-3">
        <h2 className="text-2xl font-bold">Ready to launch your first research run?</h2>
        <p className="text-xs text-indigo-100">Step directly into the prospecting workspace and begin discovery.</p>
        <button
          onClick={onLaunchWorkspace}
          className="px-6 py-3 rounded-xl bg-white text-indigo-700 hover:bg-slate-100 font-bold text-xs shadow-md transition inline-flex items-center space-x-2"
        >
          <span>Open Prospecting Workspace</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}

