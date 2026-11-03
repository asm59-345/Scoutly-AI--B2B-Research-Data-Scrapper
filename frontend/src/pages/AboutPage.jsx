import React from 'react';
import { ShieldCheck, Target, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AboutPage({ onLaunchWorkspace }) {
  return (
    <div className="max-w-4xl mx-auto py-12 space-y-16 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="space-y-4 text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          About Scoutly AI
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Intelligent B2B Prospecting <br className="hidden sm:inline" /> Built on Real Evidence
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          We empower growth teams, agencies, and researchers to discover commercial markets, extract direct verified contacts, and streamline outbound prospecting without data hallucinations.
        </p>
      </div>

      {/* The Problem We Solve & Architectural Visual */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-7 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111726] space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">The Problem We Solve</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Traditional B2B lead hunting is plagued by two extremes: expensive stale database subscriptions that sell recycled contact lists from years ago, or manual research that forces SDRs to spend hours scrolling through map directories and clicking company "Contact Us" pages one by one.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Scoutly AI closes this gap by combining autonomous browser discovery with deep website enrichment. We find active, operating businesses in real-time and inspect their public web footprint to locate validated telephone lines, corporate emails, and identified executive decision makers.
          </p>
        </div>

        <div className="md:col-span-5 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg">
          <img 
            src="/illustrations/about-illustration.svg" 
            alt="Scoutly AI Verified Grounding Security & Compliance" 
            className="w-full h-auto object-cover"
          />
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111726] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Our Mission</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            "To simplify business discovery through intelligent automation, structured research and actionable business intelligence."
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111726] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Our Vision</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            To build the most trusted, evidence-grounded B2B prospecting workspace where revenue teams can confidently connect with authentic business opportunities.
          </p>
        </div>
      </div>

      {/* Core Principles */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Our Core Principles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: "Grounding Over Hallucination", desc: "We never invent names, phone numbers, or revenue metrics. If evidence is not on the source, it is marked unverified." },
            { title: "Defensive Security by Default", desc: "Our crawlers prevent SSRF by blocking private IP ranges (RFC1918) and cloud metadata services." },
            { title: "Clean Spreadsheet Exports", desc: "All data exports are sanitized against formula injection (CWE-1236) to safeguard client environments." },
            { title: "Transparent Lead Scoring", desc: "Our 100-point scoring algorithm is explainable, breaking down points for web presence, phone, email, and leadership." }
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111726] flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="p-8 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Ready to experience Scoutly AI?</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Start prospecting with real-time web discovery today.</p>
        </div>
        <button
          onClick={onLaunchWorkspace}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shrink-0"
        >
          Launch Workspace
        </button>
      </div>

    </div>
  );
}

