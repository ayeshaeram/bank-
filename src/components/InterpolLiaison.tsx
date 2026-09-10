import React, { useState } from 'react';
import { ShieldAlert, FileText, CheckCircle2, Download, Copy, Check, Globe, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BorrowerRecord, InterpolDossier } from '../types';

interface InterpolLiaisonProps {
  records: BorrowerRecord[];
}

export const InterpolLiaison: React.FC<InterpolLiaisonProps> = ({ records }) => {
  const absconders = records.filter(r => r.isAbsconder);
  
  // Extract unique countries with absconders
  const flaggedCountries = Array.from(new Set(absconders.map(r => r.currentPassportLocation)));
  const defaultCountry = flaggedCountries[0] || 'United Arab Emirates (Dubai)';
  
  const [selectedCountry, setSelectedCountry] = useState<string>(defaultCountry);
  const [dossier, setDossier] = useState<InterpolDossier | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Suspects in the selected country
  const countrySuspects = absconders.filter(r => r.currentPassportLocation === selectedCountry);
  const countryExposure = countrySuspects.reduce((sum, r) => sum + r.loanAmount, 0);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const now = new Date();
      const code = Math.floor(1000 + Math.random() * 9000);
      const dossierId = `INTERPOL-RED-2026-${code}-${selectedCountry.slice(0, 3).toUpperCase()}`;

      const generatedDossier: InterpolDossier = {
        dossierId,
        generatedTimestamp: now.toISOString(),
        issuingEntity: "Financial Intelligence Unit & Commercial Bank Recovery Taskforce",
        liaisonAgency: `INTERPOL NCB & ${selectedCountry} Federal Police / Ministry of Interior`,
        selectedCountry,
        alertClassification: "RED NOTICE DISPATCH / CROSS-BORDER LOAN DEFAULT & ASSET RECOVERY",
        suspectsCount: countrySuspects.length,
        totalDefaultExposure: countryExposure,
        suspects: countrySuspects.map(s => ({
          suspectId: s.id,
          fullName: s.name,
          passportNumber: s.passportNumber,
          outstandingLoanExposure: `₹${s.loanAmount} Lakhs ($${(s.loanAmount * 1200).toLocaleString()})`,
          creditRiskIndex: `${s.creditRiskScore}%`,
          behavioralFraudIndicator: s.isBustOutRisk,
          jurisdiction: selectedCountry
        }))
      };

      setDossier(generatedDossier);
      setIsGenerating(false);

      // Trigger high-level feedback
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch {
        // ignore if canvas-confetti fails
      }
    }, 450);
  };

  const handleCopyJSON = () => {
    if (!dossier) return;
    navigator.clipboard.writeText(JSON.stringify(dossier, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    if (!dossier) return;
    const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dossier.dossierId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs my-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700 tracking-wide uppercase">
              Law Enforcement Gateway
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            INTERPOL & Cross-Border Police Liaison Dispatcher
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time case file generation under Mutual Legal Assistance Treaties (MLAT) & Financial Fraud Red Notices
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-600 font-medium">
            Active Absconder Havens Tracked: <strong className="text-slate-900">{flaggedCountries.length}</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Selector & Action */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Select Flagged Destination Country:
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setDossier(null);
              }}
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {flaggedCountries.map(c => (
                <option key={c} value={c}>
                  {c} ({absconders.filter(r => r.currentPassportLocation === c).length} Suspects)
                </option>
              ))}
            </select>

            <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-600 space-y-1.5">
              <div className="flex justify-between">
                <span>Suspects located in this jurisdiction:</span>
                <span className="font-bold text-red-600">{countrySuspects.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Cumulative defaulted capital at risk:</span>
                <span className="font-bold text-slate-900">₹{countryExposure.toFixed(1)} Lakhs</span>
              </div>
              <div className="flex justify-between">
                <span>Designated Police Agency:</span>
                <span className="font-semibold text-slate-700">{selectedCountry} Federal HQ</span>
              </div>
            </div>
          </div>

          {/* Suspect Quick Cards */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Flagged Absconders in {selectedCountry}:
            </div>
            {countrySuspects.length === 0 ? (
              <div className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg">
                No active absconders currently registered in this territory.
              </div>
            ) : (
              countrySuspects.map(s => (
                <div key={s.id} className="p-3 rounded-lg border border-red-200 bg-red-50/50 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{s.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({s.passportNumber})</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Default Exposure: <span className="font-semibold text-red-700">₹{s.loanAmount}L</span> • Risk: <span className="font-bold text-red-600">{s.creditRiskScore}%</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-200/80 text-red-800">
                    FLIGHT RISK
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Functional Button (Requirement 4) */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || countrySuspects.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isGenerating ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Generating Police Case Package...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Generate Law Enforcement Notification Data
              </>
            )}
          </button>
        </div>

        {/* Right Column: Case File & Interactive Confirmation Message */}
        <div className="lg:col-span-7">
          {dossier ? (
            <div className="space-y-4">
              {/* Interactive confirmation message */}
              <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-300 flex items-start gap-3 shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">
                    CASE FILE PACKAGE GENERATED FOR {selectedCountry.toUpperCase()}
                  </h4>
                  <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                    Extradition and travel red-flag notification package <strong className="font-mono">{dossier.dossierId}</strong> has been successfully compiled. 
                    The notification data packet is formatted for automatic ingestion into the local police department in {selectedCountry} and the INTERPOL National Central Bureau (NCB) Secretariat.
                  </p>
                </div>
              </div>

              {/* Dossier Code/JSON View */}
              <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-red-400" />
                    <span className="font-bold text-slate-200">{dossier.dossierId}.json</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyJSON}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-sans flex items-center gap-1 transition"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      onClick={handleDownloadJSON}
                      className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[11px] font-sans font-bold flex items-center gap-1 transition"
                    >
                      <Download className="w-3 h-3" />
                      Download Case File
                    </button>
                  </div>
                </div>

                <pre className="overflow-x-auto max-h-72 text-[11px] text-emerald-400 leading-relaxed">
                  {JSON.stringify(dossier, null, 2)}
                </pre>
              </div>

              <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span>
                  <strong>Transmission Protocol:</strong> Encrypted SFTP / Interpol I-24/7 Global Communications System
                </span>
                <span className="font-semibold text-slate-800">Priority: ULTRA-RED</span>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[320px] rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 mb-3">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">Awaiting Liaison Generation Trigger</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Select a destination jurisdiction from the left and click <span className="font-semibold text-slate-700">"Generate Law Enforcement Notification Data"</span> to compile an official Interpol Red Notice dispatch packet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
