import React, { useState, useMemo } from 'react';
import { Search, Filter, AlertTriangle, CheckCircle, ShieldAlert, ChevronRight, X, User } from 'lucide-react';
import { BorrowerRecord } from '../types';

interface MasterTableProps {
  records: BorrowerRecord[];
}

export const MasterTable: React.FC<MasterTableProps> = ({ records }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [flightFilter, setFlightFilter] = useState<string>('ALL');
  const [selectedBorrower, setSelectedBorrower] = useState<BorrowerRecord | null>(null);

  const filtered = useMemo(() => {
    return records.filter(r => {
      const matchSearch =
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.passportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.currentPassportLocation.toLowerCase().includes(searchTerm.toLowerCase());

      const matchRisk =
        riskFilter === 'ALL' ||
        (riskFilter === 'HIGH' && r.riskCategory === 'High Risk (Red)') ||
        (riskFilter === 'MEDIUM' && r.riskCategory === 'Medium Risk (Yellow)') ||
        (riskFilter === 'LOW' && r.riskCategory === 'Low Risk (Green)');

      const matchFlight =
        flightFilter === 'ALL' ||
        (flightFilter === 'ABSCONDER' && r.isAbsconder) ||
        (flightFilter === 'DOMESTIC' && r.flightRiskStatus.includes('Domestic')) ||
        (flightFilter === 'CLEARED' && !r.isAbsconder && !r.flightRiskStatus.includes('Domestic'));

      return matchSearch && matchRisk && matchFlight;
    });
  }, [records, searchTerm, riskFilter, flightFilter]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden my-6">
      {/* Table Header & Controls */}
      <div className="p-5 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Master Customer & Underwriting Ledger</h3>
            <p className="text-xs text-slate-500">
              Live audit of credit scores, behavioral loan surge ratios, and cross-border passport tracking
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, passport, ID..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-48 lg:w-56"
              />
            </div>

            {/* Risk filter */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 text-xs">
              <Filter className="w-3 h-3 text-slate-400 ml-1" />
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">All Risk Tiers</option>
                <option value="HIGH">High Risk (Red)</option>
                <option value="MEDIUM">Medium Risk (Yellow)</option>
                <option value="LOW">Low Risk (Green)</option>
              </select>
            </div>

            {/* Flight filter */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 text-xs">
              <select
                value={flightFilter}
                onChange={(e) => setFlightFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">All Flight Statuses</option>
                <option value="ABSCONDER">⚠️ Critical Absconders</option>
                <option value="DOMESTIC">Domestic High Risk</option>
                <option value="CLEARED">Cleared / Low Risk</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Borrower & ID</th>
              <th className="py-3 px-3">Age / Income</th>
              <th className="py-3 px-3">Credit Score</th>
              <th className="py-3 px-3">1st Loan → Next Request</th>
              <th className="py-3 px-3">Surge Velocity</th>
              <th className="py-3 px-3">ML Risk Score</th>
              <th className="py-3 px-3">Passport Location</th>
              <th className="py-3 px-4">Flight Alert Status</th>
              <th className="py-3 px-3 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400">
                  No records match your filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const isAbsconder = r.isAbsconder;
                return (
                  <tr
                    key={r.id}
                    className={`hover:bg-slate-50/80 transition cursor-pointer ${
                      isAbsconder ? 'bg-red-50/40' : ''
                    }`}
                    onClick={() => setSelectedBorrower(r)}
                  >
                    {/* Borrower ID & Name */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        {r.name}
                        {r.isBustOutRisk && (
                          <span className="w-2 h-2 rounded-full bg-rose-600" title="Bust-Out Risk"></span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{r.id} • {r.source}</div>
                    </td>

                    {/* Age / Income */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{r.age} yrs</div>
                      <div className="text-slate-500 font-medium">₹{r.income.toFixed(1)}L/yr</div>
                    </td>

                    {/* Credit Score */}
                    <td className="py-3 px-3">
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                          r.creditScore >= 740
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.creditScore >= 660
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {r.creditScore}
                      </span>
                    </td>

                    {/* 1st Loan -> Next Request */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">
                        ₹{r.firstApprovedLoan}L → <span className="text-rose-600 font-bold">₹{r.nextRequestedLoan}L</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{r.firstLoanStatus}</div>
                    </td>

                    {/* Surge Velocity */}
                    <td className="py-3 px-3">
                      <span
                        className={`font-bold font-mono px-2 py-0.5 rounded text-xs ${
                          r.loanSurgeRatio >= 3.0
                            ? 'bg-rose-600 text-white'
                            : r.loanSurgeRatio >= 1.5
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {r.loanSurgeRatio.toFixed(2)}x
                      </span>
                    </td>

                    {/* ML Risk Score */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            r.riskCategory === 'High Risk (Red)'
                              ? 'bg-rose-500'
                              : r.riskCategory === 'Medium Risk (Yellow)'
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                        />
                        <span className="font-bold text-slate-900">{r.creditRiskScore}%</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">{r.riskCategory.split(' ')[0]}</span>
                    </td>

                    {/* Passport Location */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800 flex items-center gap-1">
                        <span>{r.currentPassportLocation === 'India' ? '🇮🇳' : '✈️'}</span>
                        <span className="truncate max-w-[120px]" title={r.currentPassportLocation}>
                          {r.currentPassportLocation}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{r.passportNumber}</span>
                    </td>

                    {/* Flight Alert Status */}
                    <td className="py-3 px-4">
                      {isAbsconder ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-600 text-white font-bold text-[10px] shadow-xs">
                          <AlertTriangle className="w-3 h-3" />
                          ABSCONDER
                        </span>
                      ) : r.flightRiskStatus.includes('Domestic') ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold text-[10px]">
                          Domestic Watch
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium text-[10px]">
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                          Cleared
                        </span>
                      )}
                    </td>

                    {/* Inspect CTA */}
                    <td className="py-3 px-3 text-right">
                      <button className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer info */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <span>
          Showing <strong>{filtered.length}</strong> of <strong>{records.length}</strong> combined accounts
        </span>
        <span className="text-[11px] text-slate-400">
          Source: Bank Loan Risk ML Model (RandomForestClassifier, Scikit-learn)
        </span>
      </div>

      {/* Borrower Detail Modal */}
      {selectedBorrower && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedBorrower.name}</h3>
                  <div className="text-xs text-slate-500 font-mono">
                    {selectedBorrower.id} • Passport: {selectedBorrower.passportNumber}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedBorrower(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Alert banner if absconder */}
              {selectedBorrower.isAbsconder && (
                <div className="p-3 rounded-lg bg-red-100 border border-red-300 text-red-900 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">⚠️ CRITICAL FLIGHT RISK / ABSCONDER FLAG</strong>
                    High ML Credit Risk ({selectedBorrower.creditRiskScore}%) with current passport location outside India ({selectedBorrower.currentPassportLocation}).
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Credit Risk Score</span>
                  <span className="text-lg font-bold text-slate-900">{selectedBorrower.creditRiskScore}%</span>
                  <span className="text-[11px] block text-slate-500 mt-0.5">{selectedBorrower.riskCategory}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Behavioral Surge</span>
                  <span className="text-lg font-bold text-rose-600">{selectedBorrower.loanSurgeRatio}x</span>
                  <span className="text-[11px] block text-slate-500 mt-0.5">
                    {selectedBorrower.isBustOutRisk ? '⚠️ Bust-out indicator' : 'Standard trajectory'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Applicant Age:</span>
                  <span className="font-semibold text-slate-800">{selectedBorrower.age} Years</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Declared Annual Income:</span>
                  <span className="font-semibold text-slate-800">₹{selectedBorrower.income.toFixed(1)} Lakhs</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Credit Score:</span>
                  <span className="font-bold text-slate-900">{selectedBorrower.creditScore}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">1st Approved Facility:</span>
                  <span className="font-semibold text-slate-800">₹{selectedBorrower.firstApprovedLoan} Lakhs ({selectedBorrower.firstLoanStatus})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Next Requested Facility:</span>
                  <span className="font-bold text-rose-600">₹{selectedBorrower.nextRequestedLoan} Lakhs</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Current Passport Jurisdiction:</span>
                  <span className="font-bold text-slate-800">{selectedBorrower.currentPassportLocation}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedBorrower(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
