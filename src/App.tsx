import React, { useState, useMemo } from 'react';
import { parseAndCleanData } from './data/rawDatasets';
import { STREAMLIT_SCRIPT_TEXT } from './data/streamlitScriptText';
import { Header } from './components/Header';
import { KPIGrid, TopicType } from './components/KPIGrid';
import { RiskCharts } from './components/RiskCharts';
import { InterpolLiaison } from './components/InterpolLiaison';
import { MasterTable } from './components/MasterTable';
import { DataCleaningAudit } from './components/DataCleaningAudit';
import { UnderwritingSimulator } from './components/UnderwritingSimulator';
import { ScriptModal } from './components/ScriptModal';
import { TopicJumpNav, TopicBottomNav } from './components/TopicJumpNav';
import {
  BarChart3,
  TrendingUp,
  Globe2,
  Table as TableIcon,
  Sparkles,
  Calculator,
  AlertOctagon,
  FileCode
} from 'lucide-react';

export default function App() {
  const { records, audit } = useMemo(() => parseAndCleanData(), []);
  const [activeTab, setActiveTab] = useState<TopicType>('analytics');
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);

  const absconders = useMemo(() => records.filter(r => r.isAbsconder), [records]);
  const totalAbsconders = absconders.length;

  const handleJumpToTopic = (topic: TopicType) => {
    setActiveTab(topic);
    const element = document.getElementById('topic-content-anchor');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-16">
      {/* Top Application Header */}
      <Header
        onOpenScript={() => setIsScriptModalOpen(true)}
        abscondersCount={totalAbsconders}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Absconder Alert Banner */}
        {totalAbsconders > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2 rounded-lg bg-red-600 text-white shrink-0">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-950">
                  CRITICAL ABSCONDER FLIGHT RISK WARNING: {totalAbsconders} High-Risk Borrowers Detected Overseas
                </h4>
                <p className="text-xs text-red-800 mt-0.5">
                  Cross-border passport matching indicates default-intent borrowers residing in non-domestic jurisdictions. Review Interpol dispatch below.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleJumpToTopic('interpol')}
              className="self-start sm:self-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition shrink-0 cursor-pointer"
            >
              Jump to Police Liaison →
            </button>
          </div>
        )}

        {/* Top KPI Metrics Grid with Click-to-Jump Actions */}
        <KPIGrid records={records} onJumpToTopic={handleJumpToTopic} />

        {/* Prominent Quick Topic Jump Bar */}
        <TopicJumpNav
          currentTopic={activeTab}
          onSelectTopic={handleJumpToTopic}
          totalAbsconders={totalAbsconders}
        />

        {/* Tab Navigation Anchor */}
        <div id="topic-content-anchor" className="scroll-mt-20">
          <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto no-scrollbar pt-2">
            <button
              type="button"
              onClick={() => handleJumpToTopic('analytics')}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === 'analytics'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Risk & Passport Analytics
            </button>

            <button
              type="button"
              onClick={() => handleJumpToTopic('behavior')}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === 'behavior'
                  ? 'border-rose-600 text-rose-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Behavioral Shift ('Next Loan' Trick)
            </button>

            <button
              type="button"
              onClick={() => handleJumpToTopic('interpol')}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === 'interpol'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Globe2 className="w-4 h-4" />
              Interpol / Police Liaison
              {totalAbsconders > 0 && (
                <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {totalAbsconders}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleJumpToTopic('table')}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === 'table'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <TableIcon className="w-4 h-4" />
              Master Customer Ledger
            </button>

            <button
              type="button"
              onClick={() => handleJumpToTopic('audit')}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === 'audit'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Anomaly Cleaning Audit
            </button>

            <button
              type="button"
              onClick={() => handleJumpToTopic('simulator')}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === 'simulator'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calculator className="w-4 h-4" />
              Live Underwriting Simulator
            </button>
          </div>
        </div>

        {/* Tab Content Render */}
        <div className="mt-4">
          {activeTab === 'analytics' && (
            <div>
              <RiskCharts records={records} />
              <MasterTable records={records} />
            </div>
          )}

          {activeTab === 'behavior' && (
            <div>
              <div className="mb-4 p-4 rounded-xl bg-slate-900 text-white shadow-xs">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-rose-400" />
                  The "Next Loan" Trick: Identifying Bust-Out Fraud Trajectories
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Borrowers who established initial credit trust with a modest first loan (e.g. ₹6L - ₹12L) paid punctually, 
                  but subsequently request an extreme subsequent facility (e.g., ₹120L, a 10x-15x velocity surge). 
                  Such anomalous spikes are heavily penalized by our Random Forest classifier.
                </p>
              </div>
              <RiskCharts records={records} />
            </div>
          )}

          {activeTab === 'interpol' && (
            <InterpolLiaison records={records} />
          )}

          {activeTab === 'table' && (
            <MasterTable records={records} />
          )}

          {activeTab === 'audit' && (
            <DataCleaningAudit audit={audit} />
          )}

          {activeTab === 'simulator' && (
            <UnderwritingSimulator />
          )}
        </div>

        {/* Bottom Contextual Topic Jump Navigation */}
        <TopicBottomNav
          currentTopic={activeTab}
          onSelectTopic={handleJumpToTopic}
        />

        {/* Quick Python Script Banner in Footer */}
        <div className="mt-8 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <FileCode className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Python Streamlit Single-File Script Available</h4>
              <p className="text-xs text-slate-500">
                Created as <code>streamlit_app.py</code> and <code>app.py</code> in the project root. Ready to execute with <code>streamlit run streamlit_app.py</code>.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsScriptModalOpen(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-2 self-start sm:self-center cursor-pointer"
          >
            <span>Inspect & Download Python Script</span>
          </button>
        </div>
      </main>

      {/* Single-File Python Streamlit Script Modal */}
      <ScriptModal
        isOpen={isScriptModalOpen}
        onClose={() => setIsScriptModalOpen(false)}
        scriptContent={STREAMLIT_SCRIPT_TEXT}
      />
    </div>
  );
}

