import React from 'react';
import { AnomalyAuditData } from '../types';
import { AlertCircle, CheckCircle2, Database, Sparkles } from 'lucide-react';

interface DataCleaningAuditProps {
  audit: AnomalyAuditData;
}

export const DataCleaningAudit: React.FC<DataCleaningAuditProps> = ({ audit }) => {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs my-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 tracking-wide uppercase">
              ETL & Data Hygiene Pipeline
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Dynamic Data Cleaning & Column Median Imputation Audit
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automatic isolation and median remediation of File 2 data corruptions before training the RandomForestClassifier
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
          <Database className="w-4 h-4 text-slate-500" />
          <span>Raw Rows: <strong>{audit.totalRawRows}</strong> → Clean ML Rows: <strong>{audit.cleanRowsCount}</strong></span>
        </div>
      </div>

      {/* 4 Cards for Anomaly Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {/* Missing Values */}
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase">Missing Cells</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-900">{audit.missingValuesCount}</div>
          <p className="mt-1 text-[11px] text-amber-700">
            Empty fields (missing income, age, credit score, loan amount)
          </p>
        </div>

        {/* Impossible Ages */}
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase">Impossible Ages</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-900">{audit.impossibleAges.length}</div>
          <p className="mt-1 text-[11px] text-rose-700">
            e.g., Age 5 (minor), Age 150 (exceeds human lifespan)
          </p>
        </div>

        {/* Negative Incomes */}
        <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-800 uppercase">Negative Values</span>
            <AlertCircle className="w-4 h-4 text-orange-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-orange-900">{audit.negativeIncomes.length}</div>
          <p className="mt-1 text-[11px] text-orange-700">
            e.g., Row 53 with Income = -10 (inverted entry)
          </p>
        </div>

        {/* Out-of-Range Credit Scores */}
        <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-800 uppercase">Out-of-Range Scores</span>
            <AlertCircle className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-purple-900">{audit.outOfRangeCreditScores.length}</div>
          <p className="mt-1 text-[11px] text-purple-700">
            e.g., Credit Score 950, 999 (Valid range: 300-850)
          </p>
        </div>
      </div>

      {/* Column Medians Applied */}
      <div className="mt-6 p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
            Remediation Protocol: Column Medians Applied for Imputation
          </h4>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white rounded-lg border border-emerald-100 shadow-2xs">
            <span className="text-slate-500 block">Median Age</span>
            <span className="text-base font-bold text-slate-900">{audit.mediansUsed.age} Years</span>
          </div>
          <div className="p-3 bg-white rounded-lg border border-emerald-100 shadow-2xs">
            <span className="text-slate-500 block">Median Income</span>
            <span className="text-base font-bold text-slate-900">₹{audit.mediansUsed.income} Lakhs</span>
          </div>
          <div className="p-3 bg-white rounded-lg border border-emerald-100 shadow-2xs">
            <span className="text-slate-500 block">Median Credit Score</span>
            <span className="text-base font-bold text-slate-900">{audit.mediansUsed.creditScore}</span>
          </div>
          <div className="p-3 bg-white rounded-lg border border-emerald-100 shadow-2xs">
            <span className="text-slate-500 block">Median Loan Amount</span>
            <span className="text-base font-bold text-slate-900">₹{audit.mediansUsed.loanAmount} Lakhs</span>
          </div>
        </div>
      </div>

      {/* Detailed Anomaly Breakdown Tables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 text-xs">
        {/* Impossible Ages table */}
        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
          <div className="font-bold text-slate-800 mb-2 flex items-center justify-between">
            <span>Impossible Ages Log</span>
            <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-mono">
              {audit.impossibleAges.length} entries
            </span>
          </div>
          <div className="space-y-1.5">
            {audit.impossibleAges.map((a, i) => (
              <div key={i} className="p-2 bg-white rounded border border-slate-200 flex justify-between">
                <span>Row #{a.index} ({a.source})</span>
                <span className="font-bold text-rose-600 font-mono">Age: {a.age} → Imputed: {audit.mediansUsed.age}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Negative Income table */}
        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
          <div className="font-bold text-slate-800 mb-2 flex items-center justify-between">
            <span>Negative Income Log</span>
            <span className="text-[10px] bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded font-mono">
              {audit.negativeIncomes.length} entries
            </span>
          </div>
          <div className="space-y-1.5">
            {audit.negativeIncomes.map((inc, i) => (
              <div key={i} className="p-2 bg-white rounded border border-slate-200 flex justify-between">
                <span>Row #{inc.index} ({inc.source})</span>
                <span className="font-bold text-orange-600 font-mono">Income: {inc.income} → Imputed: ₹{audit.mediansUsed.income}L</span>
              </div>
            ))}
          </div>
        </div>

        {/* Out-of-Range Credit Scores table */}
        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
          <div className="font-bold text-slate-800 mb-2 flex items-center justify-between">
            <span>Out-of-Range Credit Scores</span>
            <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-mono">
              {audit.outOfRangeCreditScores.length} entries
            </span>
          </div>
          <div className="space-y-1.5">
            {audit.outOfRangeCreditScores.map((cs, i) => (
              <div key={i} className="p-2 bg-white rounded border border-slate-200 flex justify-between">
                <span>Row #{cs.index} ({cs.source})</span>
                <span className="font-bold text-purple-600 font-mono">Score: {cs.creditScore} → Imputed: {audit.mediansUsed.creditScore}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
