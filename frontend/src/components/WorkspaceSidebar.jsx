import React from 'react';
import { 
  Compass, 
  Search, 
  Terminal, 
  Bookmark, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function WorkspaceSidebar({ 
  activeTab, 
  setActiveTab, 
  isCollapsed, 
  setIsCollapsed,
  activeJobId,
  jobStatusText
}) {
  const menuItems = [
    { id: 'workspace', label: 'Prospecting Workspace', icon: Search },
    { id: 'live', label: 'Live Engine Stream', icon: Terminal, badge: activeJobId && jobStatusText === "Running" },
    { id: 'saved', label: 'Saved Leads Store', icon: Bookmark },
    { id: 'analytics', label: 'Intelligence & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings & Health', icon: Settings },
  ];

  return (
    <aside 
      className={`border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e] flex flex-col justify-between transition-all duration-200 shrink-0 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="p-3 space-y-6">
        
        {/* Workspace Brand / Mode Identifier */}
        <div className="flex items-center justify-between px-2 pt-2">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Workspace Hub
              </span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition mx-auto"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center rounded-xl p-2.5 text-xs font-semibold transition group ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex items-center space-x-3 truncate">
                  <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Status Area */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 m-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            <span>Engine Core</span>
            <span className="font-mono text-[10px] text-emerald-500">Online</span>
          </div>
          <p className="text-[10px] text-slate-400">
            FastAPI + SQLite Persistence
          </p>
        </div>
      )}
    </aside>
  );
}

