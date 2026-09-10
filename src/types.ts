export interface BorrowerRecord {
  id: string;
  name: string;
  age: number;
  income: number; // in Lakhs / thousands
  creditScore: number;
  loanAmount: number; // in Lakhs
  loanApproved: number; // 0 or 1
  source: 'File 1' | 'File 2';
  
  // Behavioral Shift Tracking
  firstApprovedLoan: number;
  firstLoanStatus: 'Paid On Time' | 'Settled with Delay' | 'Defaulted';
  nextRequestedLoan: number;
  loanSurgeRatio: number;
  isBustOutRisk: boolean;

  // Machine Learning Scoring
  creditRiskScore: number; // 0 - 100%
  riskCategory: 'Low Risk (Green)' | 'Medium Risk (Yellow)' | 'High Risk (Red)';

  // Cross-Border Flight Tracking
  passportNumber: string;
  currentPassportLocation: string;
  flightRiskStatus: '⚠️ CRITICAL FLIGHT RISK / ABSCONDER' | 'High Risk (Domestic Monitoring)' | 'Expatriate / Overseas (Low Risk)' | 'Cleared / Standard Resident';
  isAbsconder: boolean;
}

export interface AnomalyAuditData {
  totalRawRows: number;
  cleanRowsCount: number;
  missingValuesCount: number;
  impossibleAges: { index: number; age: number; source: string }[];
  negativeIncomes: { index: number; income: number; source: string }[];
  outOfRangeCreditScores: { index: number; creditScore: number; source: string }[];
  missingTargets: number;
  mediansUsed: {
    age: number;
    income: number;
    creditScore: number;
    loanAmount: number;
  };
}

export interface InterpolDossier {
  dossierId: string;
  generatedTimestamp: string;
  issuingEntity: string;
  liaisonAgency: string;
  selectedCountry: string;
  alertClassification: string;
  suspectsCount: number;
  totalDefaultExposure: number;
  suspects: {
    suspectId: string;
    fullName: string;
    passportNumber: string;
    outstandingLoanExposure: string;
    creditRiskIndex: string;
    behavioralFraudIndicator: boolean;
    jurisdiction: string;
  }[];
}
