import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Globe2,
  Table as TableIcon,
  Sparkles,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Zap,
  ArrowUpRight,
  Compass,
  X
} from 'lucide-react';
import { TopicType } from './KPIGrid';

interface TopicConfig {
  id: TopicType;
  title: string;
  shortTitle: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgLight: string;
  borderActive: string;
  textActive: string;
}

export const TOPICS: TopicConfig[] = [
  {
    id: 'analytics',
    title: 'Risk & Passport Analytics',
    shortTitle: 'Analytics',
    icon: BarChart3,
    color: 'blue',
    bgLight: 'bg-blue-50',
    borderActive: 'border-blue-600',
    textActive: 'text-blue-600'
  },
  {
    id: 'behavior',
    title: "Behavioral Shift ('Next Loan' Trick)",
    shortTitle: 'Next Loan Trick',
    badge: 'Bust-Out',
    icon: TrendingUp,
    color: 'rose',
    bgLight: 'bg-rose-50',
    borderActive: 'border-rose-600',
    textActive: 'text-rose-600'
  },
  {
    id: 'interpol',
    title: 'Interpol / Police Liaison',
    shortTitle: 'Interpol Liaison',
    icon: Globe2,
    color: 'red',
    bgLight: 'bg-red-50',
    borderActive: 'border-red-600',
    textActive: 'text-red-600'
  },
  {
    id: 'table',
    title: 'Master Customer Ledger',
    shortTitle: 'Customer Ledger',
    icon: TableIcon,
    color: 'slate',
    bgLight: 'bg-slate-100',
    borderActive: 'border-slate-800',
    textActive: 'text-slate-900'
  },
  {
    id: 'audit',
    title: 'Anomaly Cleaning Audit',
    shortTitle: 'Data Cleaning',
    badge: 'ETL Pipeline',
    icon: Sparkles,
    color: 'indigo',
    bgLight: 'bg-indigo-50',
    borderActive: 'border-indigo-600',
    textActive: 'text-indigo-600'
  },
  {
    id: 'simulator',
    title: 'Live Underwriting Simulator',
    shortTitle: 'Underwriting',
    badge: 'Live',
    icon: Calculator,
    color: 'emerald',
    bgLight: 'bg-emerald-50',
    borderActive: 'border-emerald-600',
    textActive: 'text-emerald-600'
  }
];

interface TopicJumpNavProps {
  currentTopic: TopicType;
  onSelectTopic: (topic: TopicType) => void;
  totalAbsconders: number;
}

export const TopicJumpNav: React.FC<TopicJumpNavProps> = ({
  currentTopic,
  onSelectTopic,
  totalAbsconders
}) => {
  const [isFabOpen, setIsFabOpen] = useState(false);

  const handleJump = (topic: TopicType) => {
    onSelectTopic(topic);
    setIsFabOpen(false);
    // Smooth scroll to view container
    const element = document.getElementById('topic-content-anchor');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      {/* Primary Sticky / Prominent Jump Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-black tracking-wide uppercase text-slate-900">
              Quick Topic Jump Buttons
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Click any button below to jump directly from one topic to another
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Active: <strong className="text-slate-800">{TOPICS.find(t => t.id === currentTopic)?.title}</strong>
          </span>
        </div>

        {/* The 6 Topic Jump Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {TOPICS.map((topic) => {
            const Icon = topic.icon;
            const isActive = currentTopic === topic.id;
            const isInterpol = topic.id === 'interpol';

            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => handleJump(topic.id)}
                className={`flex items-center justify-between gap-1.5 p-2.5 rounded-xl text-left transition text-xs font-semibold cursor-pointer border ${
                  isActive
                    ? `${topic.bgLight} ${topic.borderActive} ${topic.textActive} shadow-xs ring-1 ring-offset-1 ring-slate-300 font-bold`
                    : 'bg-slate-50/70 border-slate-200/80 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? 'bg-white shadow-2xs' : 'bg-slate-200/60'}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate text-[12px]">{topic.shortTitle}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {isInterpol && totalAbsconders > 0 && (
                    <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                      {totalAbsconders}
                    </span>
                  )}
                  <ArrowUpRight className={`w-3.5 h-3.5 opacity-60 ${isActive ? 'opacity-100' : ''}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Action Button (FAB) for Instant Jump anywhere on page */}
      <div className="fixed bottom-5 right-5 z-40">
        {isFabOpen ? (
          <div className="bg-slate-900 text-white rounded-2xl p-3 shadow-2xl border border-slate-800 w-72 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-400" />
                Jump to Topic
              </span>
              <button
                type="button"
                onClick={() => setIsFabOpen(false)}
                className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              {TOPICS.map((topic) => {
                const Icon = topic.icon;
                const isActive = currentTopic === topic.id;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => handleJump(topic.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{topic.title}</span>
                    </div>
                    {topic.id === 'interpol' && totalAbsconders > 0 && (
                      <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                        {totalAbsconders}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setIsFabOpen(!isFabOpen)}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-full shadow-lg border border-slate-700 text-xs font-bold transition hover:scale-105 cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Jump Topic</span>
        </button>
      </div>
    </>
  );
};

interface TopicBottomNavProps {
  currentTopic: TopicType;
  onSelectTopic: (topic: TopicType) => void;
}

export const TopicBottomNav: React.FC<TopicBottomNavProps> = ({ currentTopic, onSelectTopic }) => {
  const currentIndex = TOPICS.findIndex(t => t.id === currentTopic);
  const prevTopic = currentIndex > 0 ? TOPICS[currentIndex - 1] : null;
  const nextTopic = currentIndex < TOPICS.length - 1 ? TOPICS[currentIndex + 1] : null;

  const handleJump = (topic: TopicType) => {
    onSelectTopic(topic);
    const element = document.getElementById('topic-content-anchor');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-slate-200 bg-white rounded-2xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Previous Topic Button */}
        {prevTopic ? (
          <button
            type="button"
            onClick={() => handleJump(prevTopic.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-slate-500" />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Previous Topic</span>
              <span>{prevTopic.shortTitle}</span>
            </div>
          </button>
        ) : (
          <div className="hidden sm:block w-32" />
        )}

        {/* Center: Quick Jump Buttons */}
        <div className="flex items-center justify-center flex-wrap gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Jump Directly To:
          </span>
          {TOPICS.map((topic) => {
            const isCurrent = topic.id === currentTopic;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => handleJump(topic.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  isCurrent
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {topic.shortTitle}
              </button>
            );
          })}
        </div>

        {/* Next Topic Button */}
        {nextTopic ? (
          <button
            type="button"
            onClick={() => handleJump(nextTopic.id)}
            className="flex items-center justify-end gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer ml-auto sm:ml-0"
          >
            <div className="text-right">
              <span className="text-[10px] text-blue-200 block uppercase font-bold">Next Topic</span>
              <span>{nextTopic.shortTitle}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleJump(TOPICS[0].id)}
            className="flex items-center justify-end gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer ml-auto sm:ml-0"
          >
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Return To</span>
              <span>{TOPICS[0].shortTitle}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
    </div>
  );
};
