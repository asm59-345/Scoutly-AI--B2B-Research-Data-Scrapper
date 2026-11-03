import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  Search, 
  Globe, 
  ShieldCheck, 
  Layers, 
  Database, 
  Zap, 
  Users, 
  BarChart, 
  ChevronRight,
  Target,
  FileSpreadsheet
} from 'lucide-react';

export default function HomePage({ onLaunchWorkspace, onNavigate }) {
  return (
    <div className="space-y-24 py-8 animate-in fade-in duration-300">
      
      {/* SECTION 1: HERO */}
      <section className="relative overflow-hidden pt-6 pb-12 sm:pt-12 sm:pb-16 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen B2B Lead Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Find the Right Businesses. <br />
              <span className="text-indigo-600 dark:text-indigo-400">Discover Better Opportunities.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              Scoutly AI transforms natural language into intelligent B2B prospecting workflows, helping you discover businesses, extract verified contact information, and build actionable lead lists in minutes.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={onLaunchWorkspace}
                className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 transition group"
              >
                <span>Start Prospecting</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
              </button>

              <button
                onClick={() => onNavigate('how-it-works')}
                className="px-6 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 font-semibold text-sm transition text-center"
              >
                Explore How It Works
              </button>
            </div>

            <div className="pt-6 flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Zero Hallucinations</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Deep Website Enrichment</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Instant Spreadsheet Export</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Illustration & Mockup Generated via Stitch */}
          <div className="lg:col-span-5 relative space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl group">
              <img 
                src="/illustrations/stitch-hero-preview.png" 
                alt="Scoutly AI Obsidian Intelligence Interface"
                className="w-full h-80 object-cover object-top transition duration-300 group-hover:scale-[1.02]" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090D18] via-transparent to-transparent opacity-60 pointer-events-none" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-slate-300 backdrop-blur-md bg-slate-900/60 p-2 rounded-xl border border-white/10">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Stitch Concept · Obsidian Intelligence</span>
                </span>
                <span className="text-indigo-400 font-semibold">Live Prototype</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: PLATFORM CAPABILITIES */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Platform Capabilities
          </h2>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Engineered for Modern B2B Prospecting
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Sparkles,
              title: "AI-Powered Discovery",
              description: "Convert freeform natural language queries into validated business search parameters automatically."
            },
            {
              icon: Search,
              title: "Smart Lead Extraction",
              description: "Automate deep discovery across Google Maps feeds with resilient pagination and duplicate filtering."
            },
            {
              icon: Globe,
              title: "Deep Web Enrichment",
              description: "Crawl target company websites (/contact, /about) to identify executive names and official business emails."
            },
            {
              icon: Database,
              title: "Persistent Lead Management",
              description: "Durable SQLite database persistence, custom tag tagging, explainable qualification scores, and CSV/Excel export."
            }
          ].map((feat, i) => (
            <div key={i} className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#111726] shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <feat.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{feat.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS PREVIEW */}
      <section className="p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111726]/60 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Workflow Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              From Natural Language to Qualified Prospects
            </h2>
          </div>
          <button
            onClick={() => onNavigate('how-it-works')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
          >
            <span>Read Complete Workflow</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Describe Your Market", desc: "Type in plain English what companies and geography you are targeting." },
            { step: "02", title: "Intent Parsing", desc: "Scoutly AI grounds your criteria into structured taxonomy verticals." },
            { step: "03", title: "Discover & Enrich", desc: "Autonomous browser automation scrapes listings and extracts email/executive details." },
            { step: "04", title: "Review & Export", desc: "Inspect verified records, preview customized cold pitches, and download to CSV." }
          ].map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-mono text-xl font-black text-indigo-600 dark:text-indigo-400">{item.step}</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Visual Workflow Diagram */}
        <div className="pt-4">
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
            <img 
              src="/illustrations/workflow-diagram.svg" 
              alt="Autonomous B2B Prospecting Pipeline Architecture" 
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* SECTION 4: USE CASES */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Who Scoutly AI Serves
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Built for Revenue & Growth Teams
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "B2B Outbound Sales & SDRs",
              desc: "Quickly build verified lists of corporate decision makers and key personnel with direct phone and email records."
            },
            {
              title: "Growth Marketers & Agencies",
              desc: "Target local niche commerce and service providers with precision geographic and vertical scoping."
            },
            {
              title: "Market Researchers & Analysts",
              desc: "Gauge commercial market density, website footprint coverage, and digital presence across targeted cities."
            }
          ].map((useCase, i) => (
            <div key={i} className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111726] space-y-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{useCase.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{useCase.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: FINAL CTA */}
      <section className="p-10 rounded-3xl bg-indigo-600 text-white text-center space-y-4 shadow-xl shadow-indigo-600/10">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
          Your Next Business Opportunity Starts Here.
        </h2>
        <p className="text-sm text-indigo-100 max-w-xl mx-auto">
          Experience frictionless B2B prospecting with AI-guided query intelligence and deep web contact discovery.
        </p>
        <button
          onClick={onLaunchWorkspace}
          className="px-8 py-3.5 rounded-xl bg-white text-indigo-700 hover:bg-slate-100 font-bold text-sm shadow-md transition inline-flex items-center space-x-2"
        >
          <span>Launch Scoutly AI</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

    </div>
  );
}

