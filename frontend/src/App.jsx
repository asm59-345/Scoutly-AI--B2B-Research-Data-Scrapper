import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Search,
  Globe,
  Phone,
  Mail,
  User,
  MapPin,
  Download,
  Copy,
  CheckCircle,
  AlertTriangle,
  Clock,
  Terminal,
  Settings,
  Bookmark,
  Sun,
  Moon,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
  BarChart3,
  RefreshCw,
  FileSpreadsheet,
  X,
  Info,
  Check,
  Send,
  MessageSquare,
  Command,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  Building,
  CheckSquare,
  Square,
  Tag,
  Trash2,
  FileText
} from 'lucide-react';

export default function App() {
  // Theme state with localStorage
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('scoutly_theme') || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('scoutly_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Active view tab
  const [activeTab, setActiveTab] = useState('workspace'); // 'workspace', 'live', 'saved', 'settings'

  // Toast notification state
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Command palette state (Cmd/Ctrl + K)
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Taxonomy & Search Matrix State
  const [taxonomy, setTaxonomy] = useState({});
  const [selectedGroup, setSelectedGroup] = useState("");
  const [subCategories, setSubCategories] = useState([]);
  const [chosenSubs, setChosenSubs] = useState([]);
  
  // Natural Language Search State
  const [nlPrompt, setNlPrompt] = useState("");
  const [isParsingPrompt, setIsParsingPrompt] = useState(false);
  const [aiConfidenceNotice, setAiConfidenceNotice] = useState(null);

  // Geo & Engine parameters
  const [geoInput, setGeoInput] = useState({ country: 'India', state: 'Uttar Pradesh', city: 'Lucknow' });
  const [maxLimit, setMaxLimit] = useState(20);
  const [engineHeadless, setEngineHeadless] = useState(true);
  
  // Job & Polling State
  const [activeJobId, setActiveJobId] = useState(null);
  const [jobStatusText, setJobStatusText] = useState("");
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Results State & Multi-Select
  const [scrapedRecords, setScrapedRecords] = useState([]);
  const [searchFilterText, setSearchFilterText] = useState("");
  const [filterHasEmail, setFilterHasEmail] = useState(false);
  const [filterHasDecisionMaker, setFilterHasDecisionMaker] = useState(false);
  const [sortBy, setSortBy] = useState('default'); // 'default', 'score', 'name'
  const [selectedRowIds, setSelectedRowIds] = useState(new Set());

  // Saved Leads State
  const [savedLeads, setSavedLeads] = useState([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);

  // Detail Drawer State & Outreach Assistant
  const [selectedLead, setSelectedLead] = useState(null);
  const [drawerActiveTab, setDrawerActiveTab] = useState('overview'); // 'overview', 'outreach', 'notes'
  const [leadSummary, setLeadSummary] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [leadNotes, setLeadNotes] = useState("");
  const [leadTags, setLeadTags] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Outreach Draft State
  const [outreachType, setOutreachType] = useState('partnership'); // 'partnership', 'sales', 'introduction'
  const [outreachDraft, setOutreachDraft] = useState(null);
  const [isGeneratingOutreach, setIsGeneratingOutreach] = useState(false);

  // Health check state
  const [systemHealth, setSystemHealth] = useState(null);

  const consoleBottomRef = useRef(null);
  const timerRef = useRef(null);

  // Load Categories on mount
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setTaxonomy(data))
      .catch(() => {
        const fallback = {
          "1": { name: "Food & Beverage", sub: ["Restaurants", "Coffee Shops", "Bakeries", "Cafes", "Bars"] },
          "2": { name: "Lifestyle & Wellness", sub: ["Salons", "Gymnasium", "Spa & Wellness Centres"] },
          "3": { name: "Automotive", sub: ["Car Dealerships", "Auto Repair Shops", "Car Wash Centers"] },
          "4": { name: "Health & Medicine", sub: ["Hospitals", "Diagnostic Labs", "Pharmacies", "Dental Clinics"] },
          "7": { name: "Corporate & Tech", sub: ["Startups", "Mid-Range Corporate Offices", "IT Service Providers", "Software Companies"] }
        };
        setTaxonomy(fallback);
      });
  }, []);

  // System health fetch
  const fetchHealth = () => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setSystemHealth(data))
      .catch(() => setSystemHealth({ status: "unavailable" }));
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  // Console auto-scroll
  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  // Elapsed time tracker for running jobs
  useEffect(() => {
    if (activeJobId && (jobStatusText === "Running" || jobStatusText === "Queued")) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeJobId, jobStatusText]);

  // Polling tracker
  useEffect(() => {
    let checkInterval = null;
    if (activeJobId) {
      checkInterval = setInterval(() => {
        fetch(`/api/scrape/status/${activeJobId}`)
          .then(res => res.json())
          .then(data => {
            setJobStatusText(data.status);
            if (data.logs) setTerminalLogs(data.logs);
            if (data.records && data.records.length > 0) {
              setScrapedRecords(data.records);
            }
            if (data.status === "Completed" || data.status === "Failed") {
              clearInterval(checkInterval);
              showToast(`Research run finished with status: ${data.status}`);
            }
          })
          .catch(() => clearInterval(checkInterval));
      }, 2500);
    }
    return () => { if (checkInterval) clearInterval(checkInterval); };
  }, [activeJobId]);

  // Natural language query handler
  const handleParsePrompt = async (promptToParse) => {
    const text = promptToParse || nlPrompt;
    if (!text.trim()) return;
    setIsParsingPrompt(true);
    setAiConfidenceNotice(null);

    try {
      const res = await fetch('/api/v1/research/parse-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text })
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedGroup(data.category_group_id);
        if (taxonomy[data.category_group_id]) {
          setSubCategories(taxonomy[data.category_group_id].sub);
        }
        setChosenSubs(data.selected_subcategories);
        setGeoInput({
          country: data.country || 'India',
          state: data.state || 'Uttar Pradesh',
          city: data.city || 'Lucknow'
        });
        if (data.limit) setMaxLimit(data.limit);
        setAiConfidenceNotice({
          confidence: Math.round(data.confidence * 100),
          category: data.category_name,
          subs: data.selected_subcategories
        });
        showToast("Search intent grounded in Master Taxonomy");
      }
    } catch (err) {
      console.error("AI parser error:", err);
    } finally {
      setIsParsingPrompt(false);
    }
  };

  const handleGroupSelectionChange = (e) => {
    const gid = e.target.value;
    setSelectedGroup(gid);
    setAiConfidenceNotice(null);
    if (gid === "ALL_CATEGORIES") {
      let combined = [];
      Object.keys(taxonomy).forEach(k => { combined = [...combined, ...taxonomy[k].sub]; });
      setSubCategories(combined);
      setChosenSubs(combined);
    } else if (taxonomy[gid]) {
      setSubCategories(taxonomy[gid].sub);
      setChosenSubs(taxonomy[gid].sub); 
    } else {
      setSubCategories([]);
      setChosenSubs([]);
    }
  };

  const toggleSubcategoryCheck = (item) => {
    if (chosenSubs.includes(item)) {
      setChosenSubs(chosenSubs.filter(x => x !== item));
    } else {
      setChosenSubs([...chosenSubs, item]);
    }
  };

  const selectAllSubs = () => setChosenSubs([...subCategories]);
  const clearAllSubs = () => setChosenSubs([]);

  // Launch research job
  const triggerExecutionInstance = async () => {
    if (!selectedGroup || chosenSubs.length === 0 || !geoInput.city) return;
    
    setJobStatusText("Queued");
    setScrapedRecords([]);
    setSelectedRowIds(new Set());
    setElapsedSeconds(0);
    setTerminalLogs(["[SYSTEM] Initiating Scoutly AI research run pipeline..."]);
    setActiveTab('live');
    showToast("Research pipeline dispatched");

    try {
      const response = await fetch('/api/scrape/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_group_id: selectedGroup,
          selected_subcategories: chosenSubs,
          country: geoInput.country,
          state: geoInput.state,
          city: geoInput.city,
          limit: parseInt(maxLimit),
          headless: engineHeadless
        })
      });

      const data = await response.json();
      if (data.job_id) {
        setActiveJobId(data.job_id);
      } else {
        setJobStatusText("Failed");
        setTerminalLogs(prev => [...prev, `[ERROR] Failed to start job: ${data.detail || 'Unknown error'}`]);
      }
    } catch (e) {
      setJobStatusText("Failed");
      setTerminalLogs(prev => [...prev, `[ERROR] Server connectivity fault: ${e.message}`]);
    }
  };

  // Safe CSV export with formula injection prevention
  const exportDataToCSV = (onlySelected = false) => {
    const dataset = onlySelected && selectedRowIds.size > 0
      ? scrapedRecords.filter((_, idx) => selectedRowIds.has(idx))
      : scrapedRecords;

    if (dataset.length === 0) return;
    const headers = ["Sl.", "Firm Name", "Contact Number", "Contact Email", "Contact Person Name", "Address", "Website URL"];
    const csvRows = [headers.join(",")];
    
    dataset.forEach((r, idx) => {
      const values = headers.map(header => {
        let val = r[header] || (header === "Sl." ? idx + 1 : "");
        val = String(val);
        if (/^[=+\-@\t\r]/.test(val)) {
          val = "'" + val;
        }
        const escaped = val.replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(","));
    });
    
    const blob = new Blob([csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Scoutly_Leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${dataset.length} leads to CSV`);
  };

  // Clipboard copy
  const copyRowToClipboard = (record) => {
    const text = `Firm: ${record["Firm Name"]} | Phone: ${record["Contact Number"] || 'N/A'} | Email: ${record["Contact Email"] || 'N/A'} | Decision Maker: ${record["Contact Person Name"] || 'N/A'} | Address: ${record["Address"] || 'N/A'}`;
    navigator.clipboard.writeText(text);
    showToast(`Copied details for "${record["Firm Name"]}"`);
  };

  // Bulk copy emails
  const copySelectedEmails = () => {
    const emails = scrapedRecords
      .filter((_, idx) => selectedRowIds.has(idx))
      .map(r => r["Contact Email"])
      .filter(e => e && e.trim() !== "");
    
    if (emails.length === 0) {
      showToast("No emails found in selected rows");
      return;
    }
    navigator.clipboard.writeText(emails.join(", "));
    showToast(`Copied ${emails.length} emails to clipboard`);
  };

  // Row selection toggles
  const toggleSelectRow = (idx) => {
    const next = new Set(selectedRowIds);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setSelectedRowIds(next);
  };

  const toggleSelectAllRows = () => {
    if (selectedRowIds.size === filteredRecords.length) {
      setSelectedRowIds(new Set());
    } else {
      setSelectedRowIds(new Set(filteredRecords.map((_, i) => i)));
    }
  };

  // Drawer details & AI summary
  const openLeadDrawer = (record) => {
    setSelectedLead(record);
    setDrawerActiveTab('overview');
    setLeadSummary(null);
    setOutreachDraft(null);
    setLeadNotes(record.notes || "");
    setLeadTags(record.tags || "");
  };

  const handleGenerateSummary = async () => {
    if (!selectedLead) return;
    setIsSummarizing(true);
    try {
      const res = await fetch('/api/v1/leads/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firm_name: selectedLead["Firm Name"],
          website_url: selectedLead["Website URL"] || "",
          address: selectedLead["Address"] || "",
          category: selectedLead.category || "",
          snippets: [
            selectedLead["Contact Person Name"] ? `Key Personnel: ${selectedLead["Contact Person Name"]}` : ""
          ]
        })
      });
      if (res.ok) {
        const data = await res.json();
        setLeadSummary(data);
      }
    } catch (e) {
      console.error("Summary error:", e);
    } finally {
      setIsSummarizing(false);
    }
  };

  // Generate Outreach Pitch
  const handleGenerateOutreach = async (type = outreachType) => {
    if (!selectedLead) return;
    setIsGeneratingOutreach(true);
    setOutreachType(type);
    try {
      const res = await fetch('/api/v1/leads/draft-outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firm_name: selectedLead["Firm Name"],
          contact_person: selectedLead["Contact Person Name"] || "",
          category: selectedLead.category || "",
          website_url: selectedLead["Website URL"] || "",
          pitch_type: type
        })
      });
      if (res.ok) {
        const data = await res.json();
        setOutreachDraft(data);
      }
    } catch (e) {
      console.error("Outreach generation error:", e);
    } finally {
      setIsGeneratingOutreach(false);
    }
  };

  // Save notes & tags to backend
  const handleSaveNotes = async () => {
    if (!selectedLead || !selectedLead.id) {
      showToast("Notes saved locally");
      return;
    }
    setIsSavingNotes(true);
    try {
      const res = await fetch(`/api/v1/leads/${selectedLead.id}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: leadNotes, tags: leadTags })
      });
      if (res.ok) {
        showToast("Lead notes updated successfully");
      }
    } catch (e) {
      console.error("Failed to update notes:", e);
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Load saved leads
  const fetchSavedLeads = async () => {
    setIsLoadingSaved(true);
    try {
      const res = await fetch('/api/v1/leads/saved?limit=100');
      if (res.ok) {
        const data = await res.json();
        setSavedLeads(data);
      }
    } catch (e) {
      console.error("Failed to load saved leads:", e);
    } finally {
      setIsLoadingSaved(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'saved') {
      fetchSavedLeads();
    }
  }, [activeTab]);

  // Filter & Sort records
  let filteredRecords = scrapedRecords.filter(r => {
    const textMatch = 
      (r["Firm Name"] || "").toLowerCase().includes(searchFilterText.toLowerCase()) ||
      (r["Contact Email"] || "").toLowerCase().includes(searchFilterText.toLowerCase()) ||
      (r["Address"] || "").toLowerCase().includes(searchFilterText.toLowerCase()) ||
      (r["Contact Person Name"] || "").toLowerCase().includes(searchFilterText.toLowerCase());
    
    if (!textMatch) return false;
    if (filterHasEmail && (!r["Contact Email"] || r["Contact Email"].trim() === "")) return false;
    if (filterHasDecisionMaker && (!r["Contact Person Name"] || r["Contact Person Name"].trim() === "")) return false;
    return true;
  });

  if (sortBy === 'score') {
    filteredRecords.sort((a, b) => (b.confidence_score || 0) - (a.confidence_score || 0));
  } else if (sortBy === 'name') {
    filteredRecords.sort((a, b) => (a["Firm Name"] || "").localeCompare(b["Firm Name"] || ""));
  }

  // Helper for company initials & logo
  const getDomainFromUrl = (url) => {
    try {
      if (!url) return null;
      const clean = url.startsWith('http') ? url : `https://${url}`;
      return new URL(clean).hostname;
    } catch {
      return null;
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-200 bg-[#f8f9fa] dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold shadow-xl flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Command Palette Modal (Cmd + K) */}
      {isCommandOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-3">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Type a command or search workspace..."
                className="w-full bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none"
              />
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">ESC</span>
            </div>
            <div className="p-2 space-y-1 text-xs">
              <button
                onClick={() => { setActiveTab('workspace'); setIsCommandOpen(false); }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300"
              >
                <Search className="w-4 h-4 text-indigo-500" />
                <span>Go to Research Workspace</span>
              </button>
              <button
                onClick={() => { setActiveTab('live'); setIsCommandOpen(false); }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300"
              >
                <Terminal className="w-4 h-4 text-emerald-500" />
                <span>View Live Execution Stream</span>
              </button>
              <button
                onClick={() => { setActiveTab('saved'); setIsCommandOpen(false); }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300"
              >
                <Bookmark className="w-4 h-4 text-amber-500" />
                <span>Browse Saved Leads Store</span>
              </button>
              <button
                onClick={() => { toggleTheme(); setIsCommandOpen(false); }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
                <span>Toggle Light / Dark Mode</span>
              </button>
              <button
                onClick={() => { exportDataToCSV(); setIsCommandOpen(false); }}
                disabled={scrapedRecords.length === 0}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300 disabled:opacity-40"
              >
                <Download className="w-4 h-4 text-violet-500" />
                <span>Export Current Leads to CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-md shadow-indigo-600/20">
              S
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">Scoutly</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  v1.2
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Artisanal B2B Prospecting & Lead Intelligence
              </p>
            </div>
          </div>

          {/* Center Command Palette Trigger */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <Command className="w-3.5 h-3.5" />
            <span>Search commands...</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">⌘K</kbd>
          </button>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('workspace')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'workspace'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </button>

            <button
              onClick={() => setActiveTab('live')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'live'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Live Engine</span>
              {activeJobId && jobStatusText === "Running" && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('saved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'saved'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved Leads</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'settings'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>

            {/* Dark/Light mode toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-1.5 ml-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* TAB 1: RESEARCH WORKSPACE */}
        {activeTab === 'workspace' && (
          <div className="space-y-6">
            
            {/* Natural Language Prompt Card */}
            <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Natural Language Query Assistant
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Describe the businesses you wish to discover in plain English. Scoutly AI grounds your intent into validated search taxonomy.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={nlPrompt}
                    onChange={(e) => setNlPrompt(e.target.value)}
                    placeholder="e.g. Find independent automotive service businesses in Lucknow and identify publicly listed company contact details."
                    onKeyDown={(e) => e.key === 'Enter' && handleParsePrompt()}
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                  />
                </div>
                <button
                  onClick={() => handleParsePrompt()}
                  disabled={isParsingPrompt || !nlPrompt.trim()}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition shadow-sm"
                >
                  {isParsingPrompt ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Parse Intent</span>
                </button>
              </div>

              {/* Example Prompts */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-slate-400 font-medium">Quick examples:</span>
                {[
                  "Find independent automotive service businesses in Lucknow and identify publicly listed company contact details.",
                  "Search top 10 software companies and startups in Lucknow with contact information.",
                  "Locate diagnostic labs and dental clinics in Lucknow."
                ].map((example, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setNlPrompt(example);
                      handleParsePrompt(example);
                    }}
                    className="text-[11px] px-2.5 py-1 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg border border-slate-200 dark:border-slate-700 transition truncate max-w-xs"
                  >
                    {example}
                  </button>
                ))}
              </div>

              {/* Grounded Category Notice */}
              {aiConfidenceNotice && (
                <div className="mt-4 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">
                      Grounded: <strong>{aiConfidenceNotice.category}</strong> ({aiConfidenceNotice.subs.join(", ")})
                    </span>
                  </div>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                    {aiConfidenceNotice.confidence}% Grounding Match
                  </span>
                </div>
              )}
            </div>

            {/* Structured Search Matrix Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Category & Subcategory Pane */}
              <div className="lg:col-span-2 bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Target Industry Vertical
                    </label>
                    <span className="text-[11px] text-slate-400">11 Master Categories</span>
                  </div>
                  <select
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                    value={selectedGroup}
                    onChange={handleGroupSelectionChange}
                  >
                    <option value="">-- Choose Target Industry Vertical --</option>
                    <option value="ALL_CATEGORIES">Extract Entire Suite (All 11 Verticals)</option>
                    {Object.keys(taxonomy).map(k => (
                      <option key={k} value={k}>{taxonomy[k].name}</option>
                    ))}
                  </select>
                </div>

                {subCategories.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Sub-Sectors ({chosenSubs.length}/{subCategories.length})
                      </span>
                      <div className="space-x-2">
                        <button
                          onClick={selectAllSubs}
                          className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Select All
                        </button>
                        <span className="text-slate-400">·</span>
                        <button
                          onClick={clearAllSubs}
                          className="text-[11px] text-slate-500 hover:underline"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/40">
                      {subCategories.map(sub => (
                        <label
                          key={sub}
                          className={`flex items-center space-x-3 p-2.5 rounded-lg border text-xs cursor-pointer transition select-none ${
                            chosenSubs.includes(sub)
                              ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 font-medium'
                              : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={chosenSubs.includes(sub)}
                            onChange={() => toggleSubcategoryCheck(sub)}
                            className="w-4 h-4 text-indigo-600 border-slate-300 dark:border-slate-700 rounded focus:ring-indigo-500"
                          />
                          <span className="truncate">{sub}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Geographic Scope & Parameters */}
              <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Geographic Scope
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                        Target City (Required)
                      </label>
                      <input
                        type="text"
                        value={geoInput.city}
                        onChange={e => setGeoInput({ ...geoInput, city: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                        State / Province
                      </label>
                      <input
                        type="text"
                        value={geoInput.state}
                        onChange={e => setGeoInput({ ...geoInput, state: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        value={geoInput.country}
                        onChange={e => setGeoInput({ ...geoInput, country: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Parameters & Options */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-slate-400">Target Results Limit:</span>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={maxLimit}
                      onChange={e => setMaxLimit(e.target.value)}
                      className="w-16 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg p-1.5 text-center text-xs font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none"
                    />
                  </div>

                  <label className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={engineHeadless}
                      onChange={e => setEngineHeadless(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-slate-300 dark:border-slate-700 rounded focus:ring-indigo-500"
                    />
                    <span>Run browser silently in background</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Launch Action Button */}
            <button
              onClick={triggerExecutionInstance}
              disabled={!selectedGroup || chosenSubs.length === 0 || !geoInput.city || (activeJobId && jobStatusText === "Running")}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-indigo-600/20 transition flex items-center justify-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>
                {activeJobId && jobStatusText === "Running"
                  ? "Research Engine Execution in Progress..."
                  : `Launch Prospecting Pipeline (${chosenSubs.length} Sub-sectors in ${geoInput.city})`}
              </span>
            </button>
          </div>
        )}

        {/* TAB 2: LIVE ENGINE & STREAMING RESULTS */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            
            {/* Status & Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Leads Found</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{scrapedRecords.length}</span>
              </div>
              <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Public Business Emails</span>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                  {scrapedRecords.filter(r => r["Contact Email"] && r["Contact Email"].trim() !== "").length}
                </span>
              </div>
              <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Decision Makers Identified</span>
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                  {scrapedRecords.filter(r => r["Contact Person Name"] && r["Contact Person Name"].trim() !== "").length}
                </span>
              </div>
              <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pipeline Status & Runtime</span>
                <div className="flex items-center justify-between mt-2">
                  <span className={`px-2 py-0.5 text-xs font-mono font-bold rounded-md uppercase ${
                    jobStatusText === "Running" ? "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 animate-pulse" :
                    jobStatusText === "Completed" ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400" :
                    "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}>
                    {jobStatusText || "Idle"}
                  </span>
                  <span className="text-xs font-mono text-slate-500 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{elapsedSeconds}s</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Results Table Area */}
            <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
              
              {/* Table Toolbar & Filter Pills */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mr-2">
                    Leads Registry
                  </span>

                  {/* Filter Pills */}
                  <button
                    onClick={() => setFilterHasEmail(!filterHasEmail)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition flex items-center space-x-1 ${
                      filterHasEmail
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Mail className="w-3 h-3" />
                    <span>Has Email</span>
                  </button>

                  <button
                    onClick={() => setFilterHasDecisionMaker(!filterHasDecisionMaker)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition flex items-center space-x-1 ${
                      filterHasDecisionMaker
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <User className="w-3 h-3" />
                    <span>Has Decision Maker</span>
                  </button>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 focus:outline-none"
                  >
                    <option value="default">Sort by Order</option>
                    <option value="score">Sort by Quality Score</option>
                    <option value="name">Sort by Company Name</option>
                  </select>
                </div>

                {/* Search & Actions */}
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                  <input
                    type="text"
                    placeholder="Search results..."
                    value={searchFilterText}
                    onChange={e => setSearchFilterText(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:w-44"
                  />

                  {/* Bulk Actions dropdown / buttons */}
                  {selectedRowIds.size > 0 && (
                    <div className="flex items-center space-x-1 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-lg p-1">
                      <span className="text-[11px] font-mono px-1.5 text-indigo-600 dark:text-indigo-300 font-semibold">
                        {selectedRowIds.size} selected
                      </span>
                      <button
                        onClick={copySelectedEmails}
                        className="px-2 py-0.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-indigo-600 rounded text-[10px] font-semibold transition"
                      >
                        Copy Emails
                      </button>
                      <button
                        onClick={() => exportDataToCSV(true)}
                        className="px-2 py-0.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-indigo-600 rounded text-[10px] font-semibold transition"
                      >
                        Export Selected
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => exportDataToCSV(false)}
                    disabled={scrapedRecords.length === 0}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition shrink-0 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Enhanced Table with Company Logos / Favicons */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800/80 max-h-96">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                    <tr>
                      <th className="p-3 w-8">
                        <input
                          type="checkbox"
                          checked={filteredRecords.length > 0 && selectedRowIds.size === filteredRecords.length}
                          onChange={toggleSelectAllRows}
                          className="w-3.5 h-3.5 text-indigo-600 border-slate-300 rounded"
                        />
                      </th>
                      <th className="p-3">Company</th>
                      <th className="p-3">Confidence</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Decision Maker</th>
                      <th className="p-3">Address</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-[#111726]/60">
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="p-10 text-center text-slate-400 font-sans text-xs">
                          {activeJobId && jobStatusText === "Running" ? (
                            <div className="flex flex-col items-center space-y-2">
                              <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin" />
                              <span>Worker pipeline active... Streamed records will populate here.</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center space-y-2">
                              <Building className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                              <span>No active leads found matching filter. Launch a research job from Workspace.</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((rec, index) => {
                        const domain = getDomainFromUrl(rec["Website URL"]);
                        const isSelected = selectedRowIds.has(index);

                        return (
                          <tr
                            key={index}
                            className={`transition ${
                              isSelected
                                ? 'bg-indigo-50/50 dark:bg-indigo-950/30'
                                : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            <td className="p-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectRow(index)}
                                className="w-3.5 h-3.5 text-indigo-600 border-slate-300 rounded"
                              />
                            </td>
                            <td className="p-3 font-medium text-slate-900 dark:text-white max-w-[200px]">
                              <div className="flex items-center space-x-2.5">
                                {domain ? (
                                  <img
                                    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                                    alt=""
                                    className="w-4 h-4 rounded shrink-0"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                ) : (
                                  <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700 text-[9px] font-bold flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                                    {(rec["Firm Name"] || "B")[0]}
                                  </div>
                                )}
                                <span className="truncate">{rec["Firm Name"]}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                (rec.confidence_score || 0) >= 75 ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" :
                                (rec.confidence_score || 0) >= 50 ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800" :
                                "bg-slate-100 dark:bg-slate-800 text-slate-500"
                              }`}>
                                {rec.confidence_score || 50}%
                              </span>
                            </td>
                            <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{rec["Contact Number"] || "N/A"}</td>
                            <td className="p-3 font-mono text-indigo-600 dark:text-indigo-400 truncate max-w-[150px]">
                              {rec["Contact Email"] || "N/A"}
                            </td>
                            <td className="p-3 text-slate-700 dark:text-slate-300 font-medium max-w-[130px] truncate">
                              {rec["Contact Person Name"] || "N/A"}
                            </td>
                            <td className="p-3 text-slate-500 max-w-[180px] truncate" title={rec["Address"]}>
                              {rec["Address"] || "N/A"}
                            </td>
                            <td className="p-3 text-center space-x-1 shrink-0">
                              <button
                                onClick={() => openLeadDrawer(rec)}
                                className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 hover:text-indigo-600 rounded text-[10px] font-medium transition"
                              >
                                Details
                              </button>
                              <button
                                onClick={() => copyRowToClipboard(rec)}
                                className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-[10px] transition"
                              >
                                Copy
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Diagnostic Terminal Logs */}
            {terminalLogs.length > 0 && (
              <div className="border border-slate-200 dark:border-slate-800 bg-slate-950 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                      Scoutly Engine Execution Log
                    </h4>
                  </div>
                  {activeJobId && jobStatusText === "Running" && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </div>
                <div className="h-36 overflow-y-auto font-mono text-[11px] leading-relaxed text-emerald-400 p-2 space-y-1 bg-slate-900/60 rounded-xl border border-slate-800">
                  {terminalLogs.map((log, idx) => (
                    <div key={idx} className={log.includes("[ERROR]") ? "text-rose-400 font-bold" : log.includes("[SYSTEM]") ? "text-cyan-400" : ""}>
                      {log}
                    </div>
                  ))}
                  <div ref={consoleBottomRef} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SAVED LEADS & PERSISTENT STORE */}
        {activeTab === 'saved' && (
          <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Persistent Lead Store
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Leads persisted to SQLite database across sessions with automatic deduplication.
                </p>
              </div>
              <button
                onClick={fetchSavedLeads}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            {isLoadingSaved ? (
              <div className="p-8 text-center text-slate-400">Loading saved leads from database...</div>
            ) : savedLeads.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs font-mono">
                No persisted leads stored yet. Execute a research job to automatically populate the SQLite store.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">Company</th>
                      <th className="p-3">Quality</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Decision Maker</th>
                      <th className="p-3">Website</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {savedLeads.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">{r["Firm Name"]}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                            {r.confidence_score || 50}%
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{r["Contact Number"] || "N/A"}</td>
                        <td className="p-3 font-mono text-indigo-600 dark:text-indigo-400">{r["Contact Email"] || "N/A"}</td>
                        <td className="p-3 text-slate-700 dark:text-slate-300">{r["Contact Person Name"] || "N/A"}</td>
                        <td className="p-3">
                          {r["Website URL"] ? (
                            <a href={r["Website URL"]} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center space-x-1">
                              <span className="truncate max-w-[120px]">{r["Website URL"]}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          ) : "N/A"}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => openLeadDrawer(r)}
                            className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 hover:text-indigo-600 rounded text-[10px] font-medium transition"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SETTINGS & HEALTH */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Engine & System Health Diagnostics
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="text-xs font-semibold text-slate-500 uppercase">FastAPI Core Engine</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {systemHealth?.service || "Scoutly AI Core"}
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                    Status: {systemHealth?.status || "online"}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="text-xs font-semibold text-slate-500 uppercase">Database Persistence</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    SQLite ORM (scoutly.db)
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                    Status: Connected & Synchronized
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-3">
                Data Privacy, SSRF Protection & Compliance Controls
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Scoutly AI operates with strict DevSecOps and ethical data harvesting controls:
              </p>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2 list-disc pl-5">
                <li><strong>SSRF Defense:</strong> External website enrichment inspects target hostnames and validates DNS resolutions against RFC1918 private subnets, loopbacks (127.0.0.0/8), and cloud metadata IP (169.254.169.254).</li>
                <li><strong>Spreadsheet Formula Injection Guard:</strong> Exported CSV records automatically escape leading '=', '+', '-', '@' symbols to prevent malicious command execution in Microsoft Excel or Google Sheets.</li>
                <li><strong>No Hallucinated Data:</strong> AI summaries and score models strictly reflect evidence verified on target domains.</li>
              </ul>
            </div>
          </div>
        )}

      </main>

      {/* BUSINESS PROFILE & OUTREACH DRAWER */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/50 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xl bg-white dark:bg-[#111726] border-l border-slate-200 dark:border-slate-800 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto space-y-6">
            
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
                    {(selectedLead["Firm Name"] || "B")[0]}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate max-w-[280px]">
                      {selectedLead["Firm Name"]}
                    </h3>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {selectedLead.confidence_score || 50}% Confidence
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-[10px] text-slate-500 capitalize">
                        {selectedLead.verification_status || "Found on Source"}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 mt-4 space-x-4 text-xs font-semibold">
                <button
                  onClick={() => setDrawerActiveTab('overview')}
                  className={`pb-2 transition ${
                    drawerActiveTab === 'overview'
                      ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Overview & Evidence
                </button>
                <button
                  onClick={() => {
                    setDrawerActiveTab('outreach');
                    if (!outreachDraft) handleGenerateOutreach();
                  }}
                  className={`pb-2 transition flex items-center space-x-1 ${
                    drawerActiveTab === 'outreach'
                      ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Send className="w-3 h-3" />
                  <span>Outreach Assistant</span>
                </button>
                <button
                  onClick={() => setDrawerActiveTab('notes')}
                  className={`pb-2 transition flex items-center space-x-1 ${
                    drawerActiveTab === 'notes'
                      ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Tag className="w-3 h-3" />
                  <span>Notes & Tags</span>
                </button>
              </div>

              {/* DRAWER TAB 1: OVERVIEW */}
              {drawerActiveTab === 'overview' && (
                <div className="mt-5 space-y-5">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2.5 text-xs">
                    <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      {selectedLead["Contact Number"] ? (
                        <a href={`tel:${selectedLead["Contact Number"]}`} className="font-mono hover:underline">
                          {selectedLead["Contact Number"]}
                        </a>
                      ) : (
                        <span className="text-slate-400">No telephone registered</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      {selectedLead["Contact Email"] ? (
                        <a href={`mailto:${selectedLead["Contact Email"]}`} className="font-mono hover:underline text-indigo-600 dark:text-indigo-400">
                          {selectedLead["Contact Email"]}
                        </a>
                      ) : (
                        <span className="text-slate-400">No public email indexed</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                      <User className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span>{selectedLead["Contact Person Name"] || "Decision maker unconfirmed"}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{selectedLead["Address"] || "Physical address unlisted"}</span>
                    </div>
                    {selectedLead["Website URL"] && (
                      <div className="flex items-center space-x-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <Globe className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        <a href={selectedLead["Website URL"]} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1 truncate">
                          <span className="truncate">{selectedLead["Website URL"]}</span>
                          <ExternalLink className="w-3 h-3 shrink-0 ml-1" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* AI Grounded Summary */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Evidence-Grounded Business Profile
                      </span>
                      <button
                        onClick={handleGenerateSummary}
                        disabled={isSummarizing}
                        className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center space-x-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{isSummarizing ? "Synthesizing..." : "Refresh Summary"}</span>
                      </button>
                    </div>

                    {leadSummary ? (
                      <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                        {leadSummary.summary}
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400 italic">
                        Click "Refresh Summary" to produce a strictly grounded overview based on scraped signals.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* DRAWER TAB 2: OUTREACH ASSISTANT */}
              {drawerActiveTab === 'outreach' && (
                <div className="mt-5 space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Pitch Strategy:</span>
                    {['partnership', 'sales', 'introduction'].map(t => (
                      <button
                        key={t}
                        onClick={() => handleGenerateOutreach(t)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition ${
                          outreachType === t
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  {isGeneratingOutreach ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-indigo-500" />
                      <span>Composing tailored outreach draft...</span>
                    </div>
                  ) : outreachDraft ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Subject Line</label>
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                          <span>{outreachDraft.subject}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(outreachDraft.subject);
                              showToast("Subject line copied");
                            }}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Email Body Draft</label>
                        <textarea
                          rows={8}
                          value={outreachDraft.body}
                          readOnly
                          className="w-full p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-sans focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${outreachDraft.subject}\n\n${outreachDraft.body}`);
                            showToast("Outreach pitch copied to clipboard");
                          }}
                          className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Pitch</span>
                        </button>
                        {selectedLead["Contact Email"] && (
                          <a
                            href={`mailto:${selectedLead["Contact Email"]}?subject=${encodeURIComponent(outreachDraft.subject)}&body=${encodeURIComponent(outreachDraft.body)}`}
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Open Mail</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* DRAWER TAB 3: NOTES & TAGS */}
              {drawerActiveTab === 'notes' && (
                <div className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Lead Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={leadTags}
                      onChange={(e) => setLeadTags(e.target.value)}
                      placeholder="e.g. Hot Prospect, Follow-up, Enterprise"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Internal Research Notes
                    </label>
                    <textarea
                      rows={5}
                      value={leadNotes}
                      onChange={(e) => setLeadNotes(e.target.value)}
                      placeholder="Add qualification observations or conversation notes..."
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isSavingNotes ? "Saving..." : "Save Notes & Tags"}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => copyRowToClipboard(selectedLead)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Summary</span>
              </button>

              <button
                onClick={() => setSelectedLead(null)}
                className="px-5 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-xs font-semibold transition"
              >
                Close Drawer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
