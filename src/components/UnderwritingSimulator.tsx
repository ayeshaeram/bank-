import React, { useState } from 'react';
import { Calculator, ShieldAlert, CheckCircle, Zap } from 'lucide-react';

export const UnderwritingSimulator: React.FC = () => {
  const [name, setName] = useState('Vikram Malhotra');
  const [age, setAge] = useState(34);
  const [income, setIncome] = useState(58);
  const [creditScore, setCreditScore] = useState(710);
  const [firstLoan, setFirstLoan] = useState(9);
  const [nextLoan, setNextLoan] = useState(11);
  const [passportLocation, setPassportLocation] = useState('India');
  const [repaymentHistory, setRepaymentHistory] = useState<'Paid On Time' | 'Settled with Delay' | 'Defaulted'>('Paid On Time');

  // Real-time calculation
  const surgeRatio = Math.round((nextLoan / Math.max(1, firstLoan)) * 100) / 100;
  const isBustOutRisk = (repaymentHistory === 'Paid On Time') && (surgeRatio >= 3.0 || nextLoan >= 80);

  // ML Risk Score estimation
  const debtToIncome = nextLoan / Math.max(1, income);
  let baseRisk = 0;

  if (creditScore >= 780 && debtToIncome < 0.25) {
    baseRisk = 8 + (820 - creditScore) * 0.15;
  } else if (creditScore >= 700) {
    baseRisk = 22 + (780 - creditScore) * 0.35 + debtToIncome * 15;
  } else if (creditScore >= 640) {
    baseRisk = 48 + (700 - creditScore) * 0.45 + debtToIncome * 35;
  } else {
    baseRisk = 75 + (640 - creditScore) * 0.3 + debtToIncome * 20;
  }

  if (isBustOutRisk) {
    baseRisk = Math.min(99.0, Math.max(85.0, baseRisk * 1.5));
  }

  const riskScore = Math.min(99.5, Math.max(4.5, Math.round(baseRisk * 10) / 10));

  let riskTier: 'Low Risk (Green)' | 'Medium Risk (Yellow)' | 'High Risk (Red)';
  if (riskScore < 35.0) riskTier = 'Low Risk (Green)';
  else if (riskScore < 60.0) riskTier = 'Medium Risk (Yellow)';
  else riskTier = 'High Risk (Red)';

  const isHighRisk = riskTier === 'High Risk (Red)' || riskScore >= 60.0;
  const isOutsideIndia = passportLocation !== 'India';
  const isAbsconder = isHighRisk && isOutsideIndia;

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs my-6">
      <div className="flex items-center gap-2 mb-1">
        <Calculator className="w-5 h-5 text-blue-600" />
        <h3 className="text-base font-bold text-slate-900">Real-Time Loan Underwriter & Passport Screener</h3>
      </div>
      <p className="text-xs text-slate-500 mb-6">
        Simulate an instant credit decision, bust-out behavioral surge check, and cross-border flight clearance
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Applicant Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Applicant Age: {age} yrs</label>
            <input
              type="range"
              min="18"
              max="80"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Income (₹ Lakhs)</label>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Credit Score (FICO/CIBIL): {creditScore}</label>
            <input
              type="range"
              min="300"
              max="850"
              value={creditScore}
              onChange={(e) => setCreditScore(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">1st Approved Loan (₹ Lakhs)</label>
            <input
              type="number"
              value={firstLoan}
              onChange={(e) => setFirstLoan(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Next Requested Loan (₹ Lakhs)</label>
            <input
              type="number"
              value={nextLoan}
              onChange={(e) => setNextLoan(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">1st Loan Repayment History</label>
            <select
              value={repaymentHistory}
              onChange={(e) => setRepaymentHistory(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="Paid On Time">Paid On Time</option>
              <option value="Settled with Delay">Settled with Delay</option>
              <option value="Defaulted">Defaulted</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Passport / Manifest Jurisdiction</label>
            <select
              value={passportLocation}
              onChange={(e) => setPassportLocation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="India">India (Domestic)</option>
              <option value="United Arab Emirates (Dubai)">United Arab Emirates (Dubai)</option>
              <option value="United Kingdom (London)">United Kingdom (London)</option>
              <option value="Antigua & Barbuda">Antigua & Barbuda</option>
              <option value="Switzerland (Zurich)">Switzerland (Zurich)</option>
              <option value="Singapore">Singapore</option>
              <option value="Cyprus">Cyprus</option>
            </select>
          </div>
        </div>

        {/* Live Verdict Card */}
        <div className="lg:col-span-5 flex flex-col justify-between p-5 rounded-xl border border-slate-200 bg-slate-50">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase">Underwriting Verdict</span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-600">
                <Zap className="w-3 h-3" /> Live Scoring
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block uppercase">Credit Risk Score</span>
                <span className={`text-2xl font-black ${
                  riskScore >= 60 ? 'text-rose-600' : riskScore >= 35 ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {riskScore}%
                </span>
                <span className="text-[10px] text-slate-500 block">{riskTier}</span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block uppercase">Surge Ratio</span>
                <span className={`text-2xl font-black ${surgeRatio >= 3.0 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {surgeRatio}x
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {isBustOutRisk ? '⚠️ Bust-Out Alert' : 'Normal Trajectory'}
                </span>
              </div>
            </div>

            <div className="mt-4">
              {isAbsconder ? (
                <div className="p-3 rounded-lg bg-red-100 border border-red-300 text-red-900 text-xs">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    ⚠️ CRITICAL FLIGHT RISK / ABSCONDER
                  </div>
                  <p className="text-[11px] text-red-800 mt-1">
                    High Risk score ({riskScore}%) combined with foreign jurisdiction ({passportLocation}). Recommendation: Deny facility and notify border immigration control immediately.
                  </p>
                </div>
              ) : isHighRisk ? (
                <div className="p-3 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 text-xs">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldAlert className="w-4 h-4 text-amber-700" />
                    HIGH RISK (DOMESTIC MONITORING)
                  </div>
                  <p className="text-[11px] text-amber-800 mt-1">
                    Borrower default probability is elevated ({riskScore}%). Collateral pledge or co-signer mandatory before disbursement.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle className="w-4 h-4 text-emerald-700" />
                    CLEARED FOR APPROVAL
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-1">
                    Low risk assessment ({riskScore}%). Eligible for requested ₹{nextLoan}L facility under standard terms.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 text-center">
            Evaluated for: <strong>{name}</strong> (Age {age}, ₹{income}L Income, {creditScore} Credit Score)
          </div>
        </div>
      </div>
    </div>
  );
};
