interface HeaderProps {
  activeView: 'form' | 'summary';
  setActiveView: (view: 'form' | 'summary') => void;
  submissionsCount: number;
}

export function Header({
  activeView,
  setActiveView,
  submissionsCount,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#0e5774] flex items-center justify-center text-white shadow-xs font-bold text-sm tracking-tight">
            CID
          </div>
          <div>
            <span className="text-base font-bold text-[#0e5774] tracking-tight whitespace-nowrap block">
              Centre Infrastructure Portal
            </span>
            <span className="text-xs text-slate-500 hidden sm:block">
              Kerala Infrastructure & Facility Data Collection
            </span>
          </div>
        </div>

        {/* Top Navigation: Data Collection & Dedicated Summary Page */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveView('form')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-colors cursor-pointer ${
              activeView === 'form'
                ? 'bg-[#0e5774] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Data Collection
          </button>

          <button
            onClick={() => setActiveView('summary')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-colors cursor-pointer ${
              activeView === 'summary'
                ? 'bg-[#0e5774] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Summary {submissionsCount > 0 ? `(${submissionsCount})` : ''}
          </button>
        </nav>
      </div>
    </header>
  );
}
