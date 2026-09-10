import { BorrowerRecord, AnomalyAuditData } from '../types';

export const FILE_1_RAW = `age,income,credit_score,loan_amount,loan_approved
36,63,720,11,1
41,75,770,13,1
46,82,790,15,1
49,88,810,17,1
53,62,830,22,1
26,32,630,6,0
28,36,650,7,0
34,54,690,9,1
39,68,720,12,1
44,78,760,14,1
47,84,780,16,1
51,92,820,19,1
23,26,590,4,0
27,34,640,120,0
31,49,670,8,1
35,57,700,10,1
38,66,720,11,1
43,74,750,13,1
45,79,770,15,1
50,89,800,18,1
29,40,660,7,0
33,51,690,9,1
36,60,710,10,1
40,69,740,12,1
42,73,760,13,1
48,86,810,17,1
52,96,830,21,1
24,27,600,5,0
26,31,620,6,0`;

export const FILE_2_RAW = `Age,Income,Credit_Score,Loan_Amount,Loan_Approved
22,25,950,4,0
5,30,650,,
28,,710,6,1
32,55,720,8,1
35,60,680,10,1
40,70,750,12,1
45,80,780,15,1
,90,790,18,1
29,35,640,7,0
31,50,690,9,1
34,58,700,10,1
36,62,730,11,1
38,65,,12,1
42,72,760,14,1
48,85,800,16,1
52,95,820,20,1
27,33,600,,0
24,28,610,5,0
30,48,680,8,1
33,52,700,9,1
150,63,720,11,1
41,75,770,13,1
46,82,790,15,1
49,88,810,17,1
53,-10,830,22,1
26,32,630,6,0
28,36,650,7,0
34,54,690,9,1
39,68,999,12,1
44,78,760,14,1
47,84,780,16,1
51,92,820,19,1
23,26,590,4,0
27,34,640,120,0
31,49,670,8,1
35,57,700,10,1
38,66,720,11,1
43,74,750,13,1
45,79,770,15,1
50,89,800,18,1
29,40,660,7,0
33,51,690,9,1
36,60,710,10,1
40,69,740,12,1
42,73,760,13,1
48,86,810,17,1
52,96,830,21,1
24,27,600,5,0
26,31,620,6,0
40,70,750,12,1`;

interface RawRow {
  age?: number | null;
  income?: number | null;
  credit_score?: number | null;
  loan_amount?: number | null;
  loan_approved?: number | null;
  source: 'File 1' | 'File 2';
  rawIndex: number;
}

const CUSTOMER_NAMES = [
  "Aarav Sharma", "Rohan Mehta", "Nirav V. Singhania", "Priya Verma",
  "Vikramaditya Rao", "Mehul C. Modi", "Ananya Deshmukh", "Karan Malhotra",
  "Suresh N. Agarwal", "Sunita Nair", "Rajeshwari Pillai", "Gaurav Mittal",
  "Deepak K. Jhunjhunwala", "Pooja Hegde", "Sanjay Singhal", "Vijay M. Mallyani",
  "Neha Chawla", "Alok Tandon", "Divya Krishnan", "Aditya Birla-Roy",
  "Manoj Wadhawan", "Bhavna Joshi", "Harshad S. Parekh", "Kavita Sen",
  "Subhash Chandra-Goel", "Ritu Sethi", "Ashok Leyland-Gupta", "Swati Bansal",
  "Kapil R. Wadhawan", "Manish Sisodia-Das", "Kishore Biyani-Shah", "Tarun Tejpal-Rathore"
];

const INTERNATIONAL_DESTINATIONS = [
  "United Arab Emirates (Dubai)",
  "United Kingdom (London)",
  "Antigua & Barbuda",
  "Switzerland (Zurich)",
  "Singapore",
  "Cyprus",
  "Saint Kitts & Nevis"
];

function calculateMedian(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function parseAndCleanData(): { records: BorrowerRecord[]; audit: AnomalyAuditData } {
  const parseCSV = (csv: string, source: 'File 1' | 'File 2', offset: number): RawRow[] => {
    const lines = csv.trim().split('\n');
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const rows: RawRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      const row: RawRow = { source, rawIndex: offset + i };
      
      header.forEach((h, colIdx) => {
        const val = parts[colIdx];
        const num = val === '' || val === undefined ? null : Number(val);
        if (h === 'age') row.age = isNaN(num as number) ? null : num;
        else if (h === 'income') row.income = isNaN(num as number) ? null : num;
        else if (h === 'credit_score') row.credit_score = isNaN(num as number) ? null : num;
        else if (h === 'loan_amount') row.loan_amount = isNaN(num as number) ? null : num;
        else if (h === 'loan_approved') row.loan_approved = isNaN(num as number) ? null : num;
      });
      rows.push(row);
    }
    return rows;
  };

  const rows1 = parseCSV(FILE_1_RAW, 'File 1', 0);
  const rows2 = parseCSV(FILE_2_RAW, 'File 2', rows1.length);
  const allRawRows = [...rows1, ...rows2];

  // Anomaly tracking audit
  const audit: AnomalyAuditData = {
    totalRawRows: allRawRows.length,
    cleanRowsCount: 0,
    missingValuesCount: 0,
    impossibleAges: [],
    negativeIncomes: [],
    outOfRangeCreditScores: [],
    missingTargets: 0,
    mediansUsed: { age: 38, income: 65, creditScore: 720, loanAmount: 12 }
  };

  // 1. Detect anomalies & collect valid numbers for median calculation
  const validAges: number[] = [];
  const validIncomes: number[] = [];
  const validCreditScores: number[] = [];
  const validLoanAmounts: number[] = [];

  allRawRows.forEach(r => {
    // Missing cell check
    if (r.age == null) audit.missingValuesCount++;
    if (r.income == null) audit.missingValuesCount++;
    if (r.credit_score == null) audit.missingValuesCount++;
    if (r.loan_amount == null) audit.missingValuesCount++;
    if (r.loan_approved == null) {
      audit.missingValuesCount++;
      audit.missingTargets++;
    }

    // Age anomaly (<18 or >100)
    if (r.age != null) {
      if (r.age < 18 || r.age > 100) {
        audit.impossibleAges.push({ index: r.rawIndex, age: r.age, source: r.source });
      } else {
        validAges.push(r.age);
      }
    }

    // Income anomaly (<=0)
    if (r.income != null) {
      if (r.income <= 0) {
        audit.negativeIncomes.push({ index: r.rawIndex, income: r.income, source: r.source });
      } else {
        validIncomes.push(r.income);
      }
    }

    // Credit score anomaly (<300 or >850)
    if (r.credit_score != null) {
      if (r.credit_score < 300 || r.credit_score > 850) {
        audit.outOfRangeCreditScores.push({ index: r.rawIndex, creditScore: r.credit_score, source: r.source });
      } else {
        validCreditScores.push(r.credit_score);
      }
    }

    // Loan amount anomaly (<=0)
    if (r.loan_amount != null && r.loan_amount > 0) {
      validLoanAmounts.push(r.loan_amount);
    }
  });

  // 2. Compute Medians
  audit.mediansUsed = {
    age: Math.round(calculateMedian(validAges)),
    income: Math.round(calculateMedian(validIncomes) * 10) / 10,
    creditScore: Math.round(calculateMedian(validCreditScores)),
    loanAmount: Math.round(calculateMedian(validLoanAmounts) * 10) / 10,
  };

  // 3. Clean and impute rows
  // Filter out rows where target loan_approved is null (supervised learning requirement)
  const validLabeledRows = allRawRows.filter(r => r.loan_approved != null);
  audit.cleanRowsCount = validLabeledRows.length;

  const records: BorrowerRecord[] = validLabeledRows.map((r, i) => {
    // Dynamic cleaning & median filling
    let age = r.age;
    if (age == null || age < 18 || age > 100) {
      age = audit.mediansUsed.age;
    }

    let income = r.income;
    if (income == null || income <= 0) {
      income = audit.mediansUsed.income;
    }

    let creditScore = r.credit_score;
    if (creditScore == null || creditScore < 300 || creditScore > 850) {
      creditScore = audit.mediansUsed.creditScore;
    }

    let loanAmount = r.loan_amount;
    if (loanAmount == null || loanAmount <= 0) {
      loanAmount = audit.mediansUsed.loanAmount;
    }

    const loanApproved = Math.round(r.loan_approved!);

    // Behavioral Shift Simulation ("The Next Loan" Trick)
    let firstApprovedLoan: number;
    let firstLoanStatus: 'Paid On Time' | 'Settled with Delay' | 'Defaulted';

    if (loanAmount >= 50) {
      // The massive anomaly spike (e.g. loan 120 vs income 34)
      firstApprovedLoan = [7.0, 8.0, 10.0, 12.0][i % 4];
      firstLoanStatus = 'Paid On Time';
    } else if (creditScore >= 720) {
      firstApprovedLoan = Math.max(4.0, Math.round(loanAmount * (0.75 + (i % 5) * 0.04) * 10) / 10);
      firstLoanStatus = 'Paid On Time';
    } else {
      firstApprovedLoan = Math.max(3.0, Math.round(loanAmount * (0.65 + (i % 4) * 0.05) * 10) / 10);
      firstLoanStatus = i % 3 === 0 ? 'Settled with Delay' : (i % 5 === 0 ? 'Defaulted' : 'Paid On Time');
    }

    const nextRequestedLoan = loanAmount;
    const loanSurgeRatio = Math.round((nextRequestedLoan / Math.max(1, firstApprovedLoan)) * 100) / 100;

    // Bust-out fraud indicator: paid on time before, now asking for massive surge (>= 3.0x or requested >= 80)
    const isBustOutRisk = (firstLoanStatus === 'Paid On Time') && (loanSurgeRatio >= 3.0 || nextRequestedLoan >= 80);

    // Machine Learning Risk Model Scoring (0-100%)
    // Emulating the trained scikit-learn RandomForestClassifier probabilities
    // High credit score & high income -> low default risk
    // Low credit score, high loan-to-income ratio, or bust-out surge -> high default risk
    const debtToIncome = nextRequestedLoan / Math.max(1, income);
    let rawRisk: number;

    if (creditScore >= 780 && debtToIncome < 0.25) {
      rawRisk = 8 + (820 - creditScore) * 0.15;
    } else if (creditScore >= 700) {
      rawRisk = 22 + (780 - creditScore) * 0.35 + debtToIncome * 15;
    } else if (creditScore >= 640) {
      rawRisk = 48 + (700 - creditScore) * 0.45 + debtToIncome * 35;
    } else {
      rawRisk = 75 + (640 - creditScore) * 0.3 + debtToIncome * 20;
    }

    if (loanApproved === 0) {
      rawRisk = Math.max(rawRisk, 68);
    }

    if (isBustOutRisk) {
      rawRisk = Math.min(99.4, Math.max(88.0, rawRisk * 1.5));
    }

    const creditRiskScore = Math.min(99.5, Math.max(4.2, Math.round(rawRisk * 10) / 10));

    // Risk Category mapping: Green (Low: 0-35%), Yellow (Medium: 35-60%), Red (High: 60-100%)
    let riskCategory: 'Low Risk (Green)' | 'Medium Risk (Yellow)' | 'High Risk (Red)';
    if (creditRiskScore < 35.0) {
      riskCategory = 'Low Risk (Green)';
    } else if (creditRiskScore < 60.0) {
      riskCategory = 'Medium Risk (Yellow)';
    } else {
      riskCategory = 'High Risk (Red)';
    }

    // Cross-Border Flight Tracking
    const passportNumber = `${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + ((i + 7) % 26))}${1000000 + ((i * 123457) % 8999999)}`;
    
    let currentPassportLocation = "India";
    if (isBustOutRisk || nextRequestedLoan >= 100) {
      currentPassportLocation = INTERNATIONAL_DESTINATIONS[i % INTERNATIONAL_DESTINATIONS.length];
    } else if (creditScore < 640 && income < 35 && (i % 4 === 0)) {
      currentPassportLocation = INTERNATIONAL_DESTINATIONS[(i + 3) % INTERNATIONAL_DESTINATIONS.length];
    } else if (i % 6 === 0 && riskCategory === 'High Risk (Red)') {
      currentPassportLocation = INTERNATIONAL_DESTINATIONS[(i + 1) % INTERNATIONAL_DESTINATIONS.length];
    }

    const isHighRisk = riskCategory === 'High Risk (Red)' || creditRiskScore >= 60.0;
    const isOutsideIndia = currentPassportLocation !== "India";

    let flightRiskStatus: BorrowerRecord['flightRiskStatus'];
    let isAbsconder = false;

    if (isHighRisk && isOutsideIndia) {
      flightRiskStatus = "⚠️ CRITICAL FLIGHT RISK / ABSCONDER";
      isAbsconder = true;
    } else if (isHighRisk) {
      flightRiskStatus = "High Risk (Domestic Monitoring)";
    } else if (isOutsideIndia) {
      flightRiskStatus = "Expatriate / Overseas (Low Risk)";
    } else {
      flightRiskStatus = "Cleared / Standard Resident";
    }

    return {
      id: `BORROWER-${1001 + i}`,
      name: CUSTOMER_NAMES[i % CUSTOMER_NAMES.length],
      age,
      income,
      creditScore,
      loanAmount,
      loanApproved,
      source: r.source,
      firstApprovedLoan,
      firstLoanStatus,
      nextRequestedLoan,
      loanSurgeRatio,
      isBustOutRisk,
      creditRiskScore,
      riskCategory,
      passportNumber,
      currentPassportLocation,
      flightRiskStatus,
      isAbsconder
    };
  });

  return { records, audit };
}
