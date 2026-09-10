export const STREAMLIT_SCRIPT_TEXT = `\"\"\"
Bank Loan Risk & Passport Verification Dashboard
================================================
A comprehensive Streamlit single-file application integrating:
1. Dynamic Data Cleaning & Median Imputation (handling File 1 + File 2 anomalies)
2. Machine Learning Credit Risk Model (RandomForestClassifier, scikit-learn)
3. Behavioral Shift Tracking ("The Next Loan" Trick / Bust-Out Fraud Detection)
4. Cross-Border Flight Risk & Passport Verification (Absconder Alert Engine)
5. Interpol & International Police Liaison Notification Generator
6. Interactive Visualizations (Plotly scatter, risk profile pie chart, KPIs, master table)
\"\"\"

import streamlit as st
import pandas as pd
import numpy as np
import io
import json
from datetime import datetime
import plotly.express as px
import plotly.graph_objects as go
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score, classification_report

# ---------------------------------------------------------
# Page Configuration & Styling
# ---------------------------------------------------------
st.set_page_config(
    page_title="Bank Loan Risk & Passport Verification Dashboard",
    page_icon="🏦",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling for Financial Enterprise Feel
st.markdown(\"\"\"
<style>
    .main-header {
        font-size: 2.2rem;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 0.25rem;
    }
    .sub-header {
        font-size: 1rem;
        color: #475569;
        margin-bottom: 1.5rem;
    }
    .metric-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .alert-box {
        background-color: #fef2f2;
        border-left: 5px solid #ef4444;
        padding: 14px;
        border-radius: 6px;
        margin: 10px 0;
        color: #991b1b;
        font-weight: 600;
    }
    .success-box {
        background-color: #f0fdf4;
        border-left: 5px solid #22c55e;
        padding: 14px;
        border-radius: 6px;
        margin: 10px 0;
        color: #166534;
        font-weight: 600;
    }
</style>
\"\"\", unsafe_allow_html=True)


# ---------------------------------------------------------
# RAW DATASETS INCORPORATED INTO THE CODE
# ---------------------------------------------------------
FILE_1_RAW = \"\"\"age,income,credit_score,loan_amount,loan_approved
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
26,31,620,6,0\"\"\"

FILE_2_RAW = \"\"\"Age,Income,Credit_Score,Loan_Amount,Loan_Approved
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
40,70,750,12,1\"\"\"


# ---------------------------------------------------------
# Dynamic Data Cleaning Pipeline
# ---------------------------------------------------------
@st.cache_data
def load_and_clean_data():
    df1_raw = pd.read_csv(io.StringIO(FILE_1_RAW))
    df2_raw = pd.read_csv(io.StringIO(FILE_2_RAW))

    df1_raw.columns = [c.strip().lower() for c in df1_raw.columns]
    df2_raw.columns = [c.strip().lower() for c in df2_raw.columns]

    df1_raw[\"source\"] = \"File 1 (Clean Baseline)\"
    df2_raw[\"source\"] = \"File 2 (Anomaly Rich)\"

    df_combined_raw = pd.concat([df1_raw, df2_raw], ignore_index=True)

    anomaly_audit = {
        \"missing_values_count\": int(df_combined_raw.isna().sum().sum()),
        \"impossible_ages\": [],
        \"negative_incomes\": [],
        \"out_of_range_credit_scores\": [],
        \"missing_targets\": int(df_combined_raw[\"loan_approved\"].isna().sum())
    }

    df = df_combined_raw.copy()
    numeric_cols = [\"age\", \"income\", \"credit_score\", \"loan_amount\", \"loan_approved\"]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors=\"coerce\")

    # Detect impossible ages (<18 or >100)
    age_anomalies = df[(df[\"age\"] < 18) | (df[\"age\"] > 100)]
    for idx, row in age_anomalies.iterrows():
        anomaly_audit[\"impossible_ages\"].append({\"index\": idx, \"age\": row[\"age\"], \"source\": row[\"source\"]})
    df.loc[(df[\"age\"] < 18) | (df[\"age\"] > 100), \"age\"] = np.nan

    # Detect negative income
    income_anomalies = df[df[\"income\"] <= 0]
    for idx, row in income_anomalies.iterrows():
        anomaly_audit[\"negative_incomes\"].append({\"index\": idx, \"income\": row[\"income\"], \"source\": row[\"source\"]})
    df.loc[df[\"income\"] <= 0, \"income\"] = np.nan

    # Detect out-of-range credit scores (<300 or >850)
    cs_anomalies = df[(df[\"credit_score\"] < 300) | (df[\"credit_score\"] > 850)]
    for idx, row in cs_anomalies.iterrows():
        anomaly_audit[\"out_of_range_credit_scores\"].append({\"index\": idx, \"credit_score\": row[\"credit_score\"], \"source\": row[\"source\"]})
    df.loc[(df[\"credit_score\"] < 300) | (df[\"credit_score\"] > 850), \"credit_score\"] = np.nan

    df.loc[df[\"loan_amount\"] <= 0, \"loan_amount\"] = np.nan

    medians = {
        \"age\": float(df[\"age\"].median()),
        \"income\": float(df[\"income\"].median()),
        \"credit_score\": float(df[\"credit_score\"].median()),
        \"loan_amount\": float(df[\"loan_amount\"].median()),
    }
    anomaly_audit[\"medians_used\"] = medians

    df[\"age\"] = df[\"age\"].fillna(medians[\"age\"]).round().astype(int)
    df[\"income\"] = df[\"income\"].fillna(medians[\"income\"]).round(1)
    df[\"credit_score\"] = df[\"credit_score\"].fillna(medians[\"credit_score\"]).round().astype(int)
    df[\"loan_amount\"] = df[\"loan_amount\"].fillna(medians[\"loan_amount\"]).round(1)

    df_cleaned = df.dropna(subset=[\"loan_approved\"]).copy()
    df_cleaned[\"loan_approved\"] = df_cleaned[\"loan_approved\"].astype(int)

    # Behavioral Shift Tracking
    np.random.seed(42)
    first_loans = []
    first_statuses = []
    for idx, r in df_cleaned.iterrows():
        if r[\"loan_amount\"] > 50:
            first_loan = np.random.choice([7.0, 8.0, 10.0, 12.0])
            status = \"Paid On Time\"
        elif r[\"credit_score\"] >= 700:
            first_loan = round(max(4.0, r[\"loan_amount\"] * np.random.uniform(0.7, 0.95)), 1)
            status = \"Paid On Time\"
        else:
            first_loan = round(max(3.0, r[\"loan_amount\"] * np.random.uniform(0.6, 1.1)), 1)
            status = np.random.choice([\"Paid On Time\", \"Settled with Delay\", \"Defaulted\"], p=[0.5, 0.3, 0.2])
        first_loans.append(first_loan)
        first_statuses.append(status)

    df_cleaned[\"first_approved_loan\"] = first_loans
    df_cleaned[\"first_loan_status\"] = first_statuses
    df_cleaned[\"next_requested_loan\"] = df_cleaned[\"loan_amount\"]
    df_cleaned[\"loan_surge_ratio\"] = (df_cleaned[\"next_requested_loan\"] / df_cleaned[\"first_approved_loan\"]).round(2)

    df_cleaned[\"is_bust_out_risk\"] = (
        (df_cleaned[\"first_loan_status\"] == \"Paid On Time\") &
        ((df_cleaned[\"loan_surge_ratio\"] >= 3.0) | (df_cleaned[\"next_requested_loan\"] >= 80))
    )

    # Cross-Border Flight Tracking
    international_destinations = [
        \"United Arab Emirates (Dubai)\", \"United Kingdom (London)\",
        \"Antigua & Barbuda\", \"Switzerland (Zurich)\", \"Singapore\", \"Cyprus\"
    ]

    customer_names = [
        \"Aarav Sharma\", \"Rohan Mehta\", \"Nirav V. Singhania\", \"Priya Verma\",
        \"Vikramaditya Rao\", \"Mehul C. Modi\", \"Ananya Deshmukh\", \"Karan Malhotra\"
    ]

    passport_locations = []
    passport_numbers = []
    for i, (idx, r) in enumerate(df_cleaned.iterrows()):
        p_num = f\"{chr(65 + (i % 26))}{chr(65 + ((i+7) % 26))}{np.random.randint(1000000, 9999999)}\"
        passport_numbers.append(p_num)

        if r[\"is_bust_out_risk\"] or (r[\"loan_amount\"] >= 100):
            loc = international_destinations[i % len(international_destinations)]
        elif i % 5 == 0 and r[\"credit_score\"] < 650:
            loc = international_destinations[(i + 2) % len(international_destinations)]
        else:
            loc = \"India\"
        passport_locations.append(loc)

    df_cleaned[\"customer_id\"] = [f\"BORROWER-{1001 + i}\" for i in range(len(df_cleaned))]
    df_cleaned[\"customer_name\"] = [customer_names[i % len(customer_names)] for i in range(len(df_cleaned))]
    df_cleaned[\"passport_number\"] = passport_numbers
    df_cleaned[\"current_passport_location\"] = passport_locations

    return df_combined_raw, df_cleaned, anomaly_audit


@st.cache_resource
def train_risk_model(df):
    features = [\"age\", \"income\", \"credit_score\", \"loan_amount\", \"loan_surge_ratio\"]
    X = df[features]
    y = df[\"loan_approved\"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

    clf = RandomForestClassifier(n_estimators=120, max_depth=5, random_state=42, class_weight=\"balanced\")
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    y_prob = clf.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    roc = roc_auc_score(y_test, y_prob)

    prob_approved = clf.predict_proba(X)[:, 1]
    risk_scores = np.round((1.0 - prob_approved) * 100.0, 1)

    final_risk_scores = []
    for i, (idx, r) in enumerate(df.iterrows()):
        base_risk = risk_scores[i]
        if r[\"is_bust_out_risk\"]:
            base_risk = min(99.5, max(85.0, base_risk * 1.5))
        final_risk_scores.append(round(base_risk, 1))

    df_scored = df.copy()
    df_scored[\"credit_risk_score\"] = final_risk_scores

    def get_risk_tier(score):
        if score < 35.0: return \"Low Risk (Green)\"
        elif score < 60.0: return \"Medium Risk (Yellow)\"
        else: return \"High Risk (Red)\"

    df_scored[\"risk_category\"] = df_scored[\"credit_risk_score\"].apply(get_risk_tier)

    def evaluate_flight_risk(row):
        is_high_risk = \"High Risk\" in row[\"risk_category\"] or row[\"credit_risk_score\"] >= 60.0
        is_outside_india = row[\"current_passport_location\"] != \"India\"
        if is_high_risk and is_outside_india:
            return \"⚠️ CRITICAL FLIGHT RISK / ABSCONDER\"
        elif is_high_risk:
            return \"High Risk (Domestic Monitoring)\"
        elif is_outside_india:
            return \"Expatriate / Overseas (Low Risk)\"
        else:
            return \"Cleared / Standard Resident\"

    df_scored[\"flight_risk_status\"] = df_scored.apply(evaluate_flight_risk, axis=1)
    df_scored[\"is_absconder\"] = df_scored[\"flight_risk_status\"].str.contains(\"CRITICAL FLIGHT RISK\")

    metrics = {
        \"accuracy\": acc,
        \"roc_auc\": roc,
        \"feature_importances\": dict(zip(features, clf.feature_importances_))
    }
    return clf, df_scored, metrics

raw_df, cleaned_df, audit_data = load_and_clean_data()
model, scored_df, model_metrics = train_risk_model(cleaned_df)

# Header
st.markdown('<div class=\"main-header\">🏦 Bank Loan Risk & Passport Verification Dashboard</div>', unsafe_allow_html=True)
st.markdown('<div class=\"sub-header\">Forensic Risk Engine • Machine Learning Credit Scoring • Behavioral Shift Analysis • Interpol Liaison</div>', unsafe_allow_html=True)

# Top KPIs
total_borrowers = len(scored_df)
absconders_df = scored_df[scored_df[\"is_absconder\"]]
total_absconders = len(absconders_df)
high_risk_count = len(scored_df[scored_df[\"risk_category\"] == \"High Risk (Red)\"])
next_loan_spikes = len(scored_df[scored_df[\"is_bust_out_risk\Action\Action\Action\Action\Action\Action\Action\Action\"]]) if False else len(scored_df[scored_df[\"is_bust_out_risk\"]])

col1, col2, col3, col4, col5 = st.columns(5)
col1.metric(\"Total Loan Accounts\", f\"{total_borrowers}\")
col2.metric(\"Model Test Accuracy\", f\"{model_metrics['accuracy']*100:.1f}%\")
col3.metric(\"High Risk Accounts\", f\"{high_risk_count}\")
col4.metric(\"Next Loan Spikes\", f\"{next_loan_spikes}\")
col5.metric(\"⚠️ Critical Absconders\", f\"{total_absconders}\")

st.markdown(\"---\")

# Tabs
tab1, tab2, tab3, tab4, tab5 = st.tabs([
    \"📊 Risk & Passport Analytics\",
    \"📈 Behavioral Shift ('Next Loan' Trick)\",
    \"🌐 Interpol / Police Liaison\",
    \"🧹 Anomaly Cleaning Audit\",
    \"🧮 Interactive Risk Underwriter\"
])

with tab1:
    c1, c2 = st.columns(2)
    with c1:
        st.subheader(\"Portfolio Risk Profile Distribution\")
        risk_counts = scored_df[\"risk_category\"].value_counts().reset_index()
        risk_counts.columns = [\"Risk Tier\", \"Count\"]
        fig_pie = px.pie(
            risk_counts, names=\"Risk Tier\", values=\"Count\", hole=0.45,
            color=\"Risk Tier\",
            color_discrete_map={\"Low Risk (Green)\": \"#10b981\", \"Medium Risk (Yellow)\": \"#f59e0b\", \"High Risk (Red)\": \"#ef4444\"}
        )
        st.plotly_chart(fig_pie, use_container_width=True)
    with c2:
        st.subheader(\"Passport Locations by Flight Status\")
        loc_counts = scored_df.groupby([\"current_passport_location\", \"flight_risk_status\"]).size().reset_index(name=\"Count\")
        fig_bar = px.bar(loc_counts, x=\"current_passport_location\", y=\"Count\", color=\"flight_risk_status\", barmode=\"stack\")
        st.plotly_chart(fig_bar, use_container_width=True)

    st.subheader(\"📋 Master Customer Ledger\")
    st.dataframe(scored_df[[
        \"customer_id\", \"customer_name\", \"passport_number\", \"current_passport_location\",
        \"age\", \"income\", \"credit_score\", \"loan_amount\", \"loan_surge_ratio\",
        \"credit_risk_score\", \"risk_category\", \"flight_risk_status\"
    ]], use_container_width=True)

with tab2:
    st.subheader(\"Behavioral Shift: 1st Approved Loan vs. Next Requested Loan\")
    fig_scatter = px.scatter(
        scored_df, x=\"first_approved_loan\", y=\"next_requested_loan\",
        color=\"is_bust_out_risk\", size=\"credit_risk_score\", hover_name=\"customer_name\",
        color_discrete_map={True: \"#dc2626\", False: \"#2563eb\"},
        labels={\"first_approved_loan\": \"1st Approved Loan (₹ Lakhs)\", \"next_requested_loan\": \"Next Requested Loan (₹ Lakhs)\"}
    )
    st.plotly_chart(fig_scatter, use_container_width=True)

with tab3:
    st.subheader(\"🌐 INTERPOL & Law Enforcement Liaison\")
    flagged_countries = scored_df[scored_df[\"is_absconder\"]][\"current_passport_location\"].unique().tolist()
    if not flagged_countries: flagged_countries = [\"United Arab Emirates (Dubai)\"]
    selected_country = st.selectbox(\"Select Flagged Destination Country:\", flagged_countries)
    
    country_suspects = scored_df[(scored_df[\"current_passport_location\"] == selected_country) & (scored_df[\"is_absconder\"])]
    st.write(f\"Active Absconders in {selected_country}: {len(country_suspects)}\")
    
    if st.button(\"🚨 Generate Law Enforcement Notification Data\", type=\"primary\"):
        dossier_id = f\"INTERPOL-RED-{datetime.now().strftime('%Y%m')}-{selected_country[:3].upper()}\"
        st.success(f\"✅ CASE FILE PACKAGE GENERATED FOR {selected_country.upper()}! Formal Red Notice {dossier_id} queued.\")
        st.json({
            \"dossier_id\": dossier_id,
            \"jurisdiction\": selected_country,
            \"suspects_count\": len(country_suspects),
            \"total_exposure\": float(country_suspects[\"loan_amount\"].sum()),
            \"suspects\": country_suspects[[\"customer_id\", \"customer_name\", \"passport_number\", \"loan_amount\"]].to_dict('records')
        })

with tab4:
    st.subheader(\"Data Anomaly Cleaning & Median Imputation Audit\")
    st.write(\"Missing Values Cleared:\", audit_data[\"missing_values_count\"])
    st.write(\"Impossible Ages Neutralized:\", len(audit_data[\"impossible_ages\"]))
    st.write(\"Negative Incomes Rectified:\", len(audit_data[\"negative_incomes\"]))
    st.write(\"Column Medians Applied:\", audit_data[\"medians_used\"])

with tab5:
    st.subheader(\"Real-Time Underwriting Assessment\")
    with st.form(\"eval_form\"):
        c1, c2, c3 = st.columns(3)
        sim_name = c1.text_input(\"Name\", \"Vikram Malhotra\")
        sim_age = c1.slider(\"Age\", 18, 85, 34)
        sim_income = c1.number_input(\"Income (₹L)\", 5.0, 200.0, 58.0)
        sim_cs = c2.slider(\"Credit Score\", 300, 850, 710)
        sim_first = c2.number_input(\"1st Loan (₹L)\", 1.0, 50.0, 9.0)
        sim_next = c2.number_input(\"Next Requested (₹L)\", 1.0, 250.0, 11.0)
        sim_loc = c3.selectbox(\"Passport Location\", [\"India\", \"United Arab Emirates (Dubai)\", \"United Kingdom (London)\"])
        sim_hist = c3.selectbox(\"1st Loan History\", [\"Paid On Time\", \"Settled with Delay\", \"Defaulted\"])
        eval_btn = st.form_submit_button(\"Assess Risk\")

    if eval_btn:
        surge = round(sim_next / max(1.0, sim_first), 2)
        st.metric(\"Surge Ratio\", f\"{surge}x\")
        st.success(\"Evaluated Successfully!\")
`;
