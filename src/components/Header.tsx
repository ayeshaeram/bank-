import React from 'react';
import { ShieldCheck, Code, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  onOpenScript: () => void;
  abscondersCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenScript, abscondersCount }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-xs">
            🏦
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                ApexBank • Risk & Passport Verification Dashboard
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> ML Verified
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Lead Data Science & Forensic Risk Portal • RandomForestClassifier (scikit-learn)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {abscondersCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs font-bold animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              <span>{abscondersCount} Critical Absconders</span>
            </div>
          )}

          <button
            type="button"
            onClick={onOpenScript}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-3.5 rounded-lg transition shadow-xs cursor-pointer"
          >
            <Code className="w-3.5 h-3.5 text-emerald-400" />
            <span>View Streamlit Python Script</span>
          </button>
        </div>
      </div>
    </header>
  );
};
