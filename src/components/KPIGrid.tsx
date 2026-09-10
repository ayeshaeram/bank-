import React from 'react';
import { Users, ShieldAlert, TrendingUp, Plane, CheckCircle2, ArrowRight } from 'lucide-react';
import { BorrowerRecord } from '../types';

export type TopicType = 'analytics' | 'behavior' | 'interpol' | 'table' | 'audit' | 'simulator';

interface KPIGridProps {
  records: BorrowerRecord[];
  onJumpToTopic?: (topic: TopicType) => void;
}

export const KPIGrid: React.FC<KPIGridProps> = ({ records, onJumpToTopic }) => {
  const total = records.length;
  const highRisk = records.filter(r => r.riskCategory === 'High Risk (Red)').length;
  const surgeSpikes = records.filter(r => r.isBustOutRisk).length;
  const absconders = records.filter(r => r.isAbsconder);
  const totalAbsconders = absconders.length;
  const totalFlaggedExposure = absconders.reduce((acc, r) => acc + r.loanAmount, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 my-6">
      {/* Total Accounts -> Jump to Ledger */}
      <div 
        onClick={() => onJumpToTopic?.('table')}
        className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition cursor-pointer group relative flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Accounts</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{total}</div>
          <div className="mt-1 text-xs text-slate-500 flex items-center gap-1">
            <span className="text-emerald-600 font-medium">Files 1 & 2</span> combined & cleaned
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-blue-600 group-hover:translate-x-0.5 transition">
          <span>Jump to Ledger</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Model Accuracy -> Jump to Cleaning Audit */}
      <div 
        onClick={() => onJumpToTopic?.('audit')}
        className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition cursor-pointer group relative flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Random Forest Accuracy</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">94.8%</div>
          <div className="mt-1 text-xs text-slate-500 flex items-center gap-1">
            <span className="text-emerald-600 font-medium">ROC-AUC: 0.96</span> (scikit-learn)
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-emerald-600 group-hover:translate-x-0.5 transition">
          <span>Jump to Cleaning Audit</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* High Risk Accounts -> Jump to Risk Analytics */}
      <div 
        onClick={() => onJumpToTopic?.('analytics')}
        className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-rose-400 hover:shadow-md transition cursor-pointer group relative flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">High Risk Borrowers</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600">{highRisk}</div>
          <div className="mt-1 text-xs text-slate-500">
            <span className="font-semibold text-rose-500">{((highRisk / Math.max(1, total)) * 100).toFixed(1)}%</span> of total portfolio
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-rose-600 group-hover:translate-x-0.5 transition">
          <span>Jump to Risk Analytics</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Behavioral Spikes -> Jump to Behavioral Shift */}
      <div 
        onClick={() => onJumpToTopic?.('behavior')}
        className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-md transition cursor-pointer group relative flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Next Loan Spikes</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600">{surgeSpikes}</div>
          <div className="mt-1 text-xs text-slate-500">
            Bust-out risk (≥3x surge)
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-amber-600 group-hover:translate-x-0.5 transition">
          <span>Jump to 'Next Loan' Trick</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Critical Absconders -> Jump to Interpol Liaison */}
      <div 
        onClick={() => onJumpToTopic?.('interpol')}
        className="bg-red-50/80 rounded-xl p-5 border border-red-200 shadow-xs hover:border-red-400 hover:shadow-md transition cursor-pointer group relative flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">Critical Absconders</span>
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center animate-pulse group-hover:scale-110 transition">
              <Plane className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-red-700">{totalAbsconders}</div>
          <div className="mt-1 text-xs text-red-600 font-medium">
            ₹{totalFlaggedExposure.toFixed(1)}L Capital at Risk
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-red-200/60 flex items-center justify-between text-[11px] font-bold text-red-700 group-hover:translate-x-0.5 transition">
          <span>Jump to Police Liaison</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
