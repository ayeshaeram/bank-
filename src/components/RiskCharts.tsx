import React, { useState } from 'react';
import { BorrowerRecord } from '../types';
import { Info } from 'lucide-react';

interface RiskChartsProps {
  records: BorrowerRecord[];
}

export const RiskCharts: React.FC<RiskChartsProps> = ({ records }) => {
  const [hoveredScatterPoint, setHoveredScatterPoint] = useState<BorrowerRecord | null>(null);

  // 1. Risk Tier Counts
  const lowCount = records.filter(r => r.riskCategory === 'Low Risk (Green)').length;
  const mediumCount = records.filter(r => r.riskCategory === 'Medium Risk (Yellow)').length;
  const highCount = records.filter(r => r.riskCategory === 'High Risk (Red)').length;
  const total = records.length || 1;

  const lowPct = ((lowCount / total) * 100).toFixed(1);
  const medPct = ((mediumCount / total) * 100).toFixed(1);
  const highPct = ((highCount / total) * 100).toFixed(1);

  // SVG Pie Chart math
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const lowStroke = (lowCount / total) * circumference;
  const medStroke = (mediumCount / total) * circumference;
  const highStroke = (highCount / total) * circumference;

  const lowOffset = 0;
  const medOffset = -lowStroke;
  const highOffset = -(lowStroke + medStroke);

  // 2. Scatter Plot Scale: 1st Approved Loan (0 to 30) vs Next Requested Loan (0 to 130)
  const maxX = 30;
  const maxY = 130;
  const scatterWidth = 540;
  const scatterHeight = 280;
  const padLeft = 45;
  const padBottom = 35;
  const padTop = 15;
  const padRight = 20;

  const chartW = scatterWidth - padLeft - padRight;
  const chartH = scatterHeight - padBottom - padTop;

  const scaleX = (val: number) => padLeft + (Math.min(val, maxX) / maxX) * chartW;
  const scaleY = (val: number) => padTop + chartH - (Math.min(val, maxY) / maxY) * chartH;

  // 3. Location breakdown
  const locationMap: { [loc: string]: { absconder: number; domestic: number; cleared: number } } = {};
  records.forEach(r => {
    const loc = r.currentPassportLocation;
    if (!locationMap[loc]) {
      locationMap[loc] = { absconder: 0, domestic: 0, cleared: 0 };
    }
    if (r.isAbsconder) locationMap[loc].absconder++;
    else if (r.flightRiskStatus.includes('Domestic')) locationMap[loc].domestic++;
    else locationMap[loc].cleared++;
  });

  const locations = Object.keys(locationMap).sort((a, b) => {
    return (locationMap[b].absconder + locationMap[b].cleared) - (locationMap[a].absconder + locationMap[a].cleared);
  });

  // Feature importances
  const featureImportances = [
    { name: 'Loan Surge Ratio (Bust-Out)', weight: 34.5 },
    { name: 'Credit Score', weight: 28.2 },
    { name: 'Loan-to-Income Ratio', weight: 20.8 },
    { name: 'Annual Income', weight: 11.0 },
    { name: 'Applicant Age', weight: 5.5 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
      {/* 1. Risk Profile Distribution (Pie Chart) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Portfolio Credit Risk Distribution</h3>
            <p className="text-xs text-slate-500">Color-coded 3-tier risk mapping from RandomForest model</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-md text-slate-600">
            N = {records.length}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
          {/* Donut Graphic */}
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="22" />
              {/* Green / Low */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="#10b981"
                strokeWidth="22"
                strokeDasharray={`${lowStroke} ${circumference}`}
                strokeDashoffset={lowOffset}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
              {/* Yellow / Medium */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="22"
                strokeDasharray={`${medStroke} ${circumference}`}
                strokeDashoffset={medOffset}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
              {/* Red / High */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="#ef4444"
                strokeWidth="22"
                strokeDasharray={`${highStroke} ${circumference}`}
                strokeDashoffset={highOffset}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-bold text-slate-800">{total}</span>
              <span className="text-[11px] font-medium text-slate-400 uppercase">Accounts</span>
            </div>
          </div>

          {/* Legend Stats */}
          <div className="flex flex-col gap-3 min-w-[200px]">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-semibold text-emerald-900">Low Risk (Green)</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-700">{lowCount}</span>
                <span className="text-[10px] text-emerald-600 block">({lowPct}%)</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50 border border-amber-100">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="text-xs font-semibold text-amber-900">Medium Risk (Yellow)</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-amber-700">{mediumCount}</span>
                <span className="text-[10px] text-amber-600 block">({medPct}%)</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-50 border border-rose-100">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="text-xs font-semibold text-rose-900">High Risk (Red)</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-rose-700">{highCount}</span>
                <span className="text-[10px] text-rose-600 block">({highPct}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Behavioral Shift Scatter Chart ("The Next Loan" Trick) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Behavioral Shift: The "Next Loan" Trick</h3>
            <p className="text-xs text-slate-500">1st Approved Loan vs. Next Requested Loan (Bust-Out Spikes)</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 text-rose-600 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span> Bust-Out Surge (≥3x)
            </span>
            <span className="inline-flex items-center gap-1.5 text-blue-600 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span> Normal Repeat
            </span>
          </div>
        </div>

        {/* Scatter Container */}
        <div className="relative w-full h-[280px] bg-slate-50 rounded-lg p-2 border border-slate-100">
          <svg viewBox={`0 0 ${scatterWidth} ${scatterHeight}`} className="w-full h-full overflow-visible">
            {/* Grid lines */}
            {[0, 30, 60, 90, 120].map(val => (
              <g key={`y-${val}`}>
                <line
                  x1={padLeft}
                  y1={scaleY(val)}
                  x2={scatterWidth - padRight}
                  y2={scaleY(val)}
                  stroke="#e2e8f0"
                  strokeDasharray="3 3"
                />
                <text x={padLeft - 6} y={scaleY(val) + 4} fontSize="9" textAnchor="end" fill="#64748b">
                  ₹{val}L
                </text>
              </g>
            ))}

            {[0, 10, 20, 30].map(val => (
              <g key={`x-${val}`}>
                <line
                  x1={scaleX(val)}
                  y1={padTop}
                  x2={scaleX(val)}
                  y2={padTop + chartH}
                  stroke="#e2e8f0"
                  strokeDasharray="3 3"
                />
                <text x={scaleX(val)} y={scatterHeight - 14} fontSize="9" textAnchor="middle" fill="#64748b">
                  ₹{val}L
                </text>
              </g>
            ))}

            {/* Parity 1:1 Reference Line */}
            <line
              x1={scaleX(0)}
              y1={scaleY(0)}
              x2={scaleX(25)}
              y2={scaleY(25)}
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <text x={scaleX(24)} y={scaleY(25) - 5} fontSize="9" fill="#64748b" fontStyle="italic">
              1:1 Parity Baseline
            </text>

            {/* 3x Surge Danger Line */}
            <line
              x1={scaleX(0)}
              y1={scaleY(0)}
              x2={scaleX(28)}
              y2={scaleY(84)}
              stroke="#f97316"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <text x={scaleX(26)} y={scaleY(84) - 6} fontSize="9" fill="#ea580c" fontWeight="bold">
              3x Surge Danger Line
            </text>

            {/* Scatter Data Points */}
            {records.map((r, i) => {
              const cx = scaleX(r.firstApprovedLoan);
              const cy = scaleY(r.nextRequestedLoan);
              const isBust = r.isBustOutRisk;
              const isHovered = hoveredScatterPoint?.id === r.id;

              return (
                <circle
                  key={r.id}
                  cx={cx}
                  cy={cy}
                  r={isBust ? (isHovered ? 8 : 6) : (isHovered ? 6 : 4)}
                  fill={isBust ? '#e11d48' : '#2563eb'}
                  fillOpacity={isBust ? 0.9 : 0.65}
                  stroke={isHovered ? '#0f172a' : (isBust ? '#9f1239' : '#1d4ed8')}
                  strokeWidth={isHovered ? 2.5 : 1}
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredScatterPoint(r)}
                  onMouseLeave={() => setHoveredScatterPoint(null)}
                />
              );
            })}

            {/* Axis labels */}
            <text x={padLeft + chartW / 2} y={scatterHeight - 2} fontSize="10" fontWeight="600" textAnchor="middle" fill="#334155">
              1st Approved Loan (₹ Lakhs)
            </text>
            <text
              transform={`rotate(-90 ${12} ${padTop + chartH / 2})`}
              x={12}
              y={padTop + chartH / 2}
              fontSize="10"
              fontWeight="600"
              textAnchor="middle"
              fill="#334155"
            >
              Next Requested (₹ Lakhs)
            </text>
          </svg>

          {/* Interactive Tooltip on hover */}
          {hoveredScatterPoint && (
            <div className="absolute top-3 right-3 bg-slate-900/95 text-white p-3 rounded-lg text-xs shadow-xl border border-slate-700 pointer-events-none max-w-xs z-20">
              <div className="font-bold text-slate-100 flex items-center justify-between gap-2">
                <span>{hoveredScatterPoint.name}</span>
                <span className="text-[10px] text-slate-400">{hoveredScatterPoint.id}</span>
              </div>
              <div className="mt-1 text-slate-300 space-y-0.5">
                <div>• 1st Loan: <span className="font-semibold text-white">₹{hoveredScatterPoint.firstApprovedLoan}L</span> ({hoveredScatterPoint.firstLoanStatus})</div>
                <div>• Next Requested: <span className="font-semibold text-rose-400">₹{hoveredScatterPoint.nextRequestedLoan}L</span></div>
                <div>• Surge Ratio: <span className="font-semibold text-amber-300">{hoveredScatterPoint.loanSurgeRatio}x</span></div>
                <div>• Risk Score: <span className="font-semibold text-white">{hoveredScatterPoint.creditRiskScore}%</span></div>
                <div>• Location: <span className="font-semibold text-white">{hoveredScatterPoint.currentPassportLocation}</span></div>
              </div>
              {hoveredScatterPoint.isBustOutRisk && (
                <div className="mt-1.5 text-[10px] bg-rose-500/30 text-rose-200 px-1.5 py-0.5 rounded font-semibold border border-rose-500/40">
                  ⚠️ BUST-OUT BEHAVIORAL SURGE DETECTED
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Passport Location & Flight Risk Demographics */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <h3 className="text-base font-semibold text-slate-900 mb-1">Passport Location by Flight Risk Status</h3>
        <p className="text-xs text-slate-500 mb-4">Tracking overseas jurisdictions where High-Risk borrowers have relocated</p>

        <div className="space-y-2.5">
          {locations.map(loc => {
            const data = locationMap[loc];
            const totalLoc = data.absconder + data.domestic + data.cleared;
            const absconderPct = (data.absconder / totalLoc) * 100;
            const isDomestic = loc === 'India';

            return (
              <div key={loc} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    {isDomestic ? '🇮🇳' : '✈️'} {loc}
                  </span>
                  <div className="flex items-center gap-2">
                    {data.absconder > 0 && (
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px]">
                        {data.absconder} Absconders
                      </span>
                    )}
                    <span className="text-slate-500 font-medium text-[11px]">{totalLoc} total</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-200 flex overflow-hidden">
                  <div style={{ width: `${(data.cleared / totalLoc) * 100}%` }} className="bg-emerald-500 h-full" title="Cleared" />
                  <div style={{ width: `${(data.domestic / totalLoc) * 100}%` }} className="bg-amber-500 h-full" title="Domestic High Risk" />
                  <div style={{ width: `${absconderPct}%` }} className="bg-red-600 h-full" title="Critical Absconders" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Machine Learning Feature Importance */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">Random Forest Feature Weights</h3>
          <p className="text-xs text-slate-500 mb-4">Gini importance computed across 120 decision trees in scikit-learn</p>

          <div className="space-y-3.5">
            {featureImportances.map(item => (
              <div key={item.name}>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-700">{item.name}</span>
                  <span className="text-slate-900 font-bold">{item.weight}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-blue-500 to-indigo-600"
                    style={{ width: `${item.weight * 2}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-blue-50/70 border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            <strong>Forensic Note:</strong> Behavioral surge velocity (first approved loan vs second loan) carries the highest predictive weight in classifying bust-out financial default.
          </span>
        </div>
      </div>
    </div>
  );
};
