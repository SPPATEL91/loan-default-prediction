import { DECISION_TREE_MODEL, LOGISTIC_REGRESSION_MODEL } from './modelsData.js';

/**
 * runClientPrediction
 * ====================
 * Robust ML inference engine running Decision Tree & Logistic Regression models.
 * Automatically handles scaling mismatches (e.g. DTI as 28% vs 0.28) and string variations.
 */
export function runClientPrediction(data, modelId = "decision_tree") {
  if (!data) return null;

  // 1. Parse & Normalize Numerical Features
  const age = parseFloat(data.Age) || 35;
  const income = parseFloat(data.Income) || 50000;
  const loanAmount = parseFloat(data.LoanAmount) || 15000;
  const creditScore = parseFloat(data.CreditScore) || 700;
  const monthsEmployed = parseFloat(data.MonthsEmployed) || 24;
  const numCreditLines = parseFloat(data.NumCreditLines) || 3;
  let interestRate = parseFloat(data.InterestRate) || 7.5;
  const loanTerm = parseFloat(data.LoanTerm) || 36;
  let dtiRatio = parseFloat(data.DTIRatio) || 0.3;

  // DTI Normalization: If user entered DTI as percentage (e.g. 28 or 45), convert to decimal (0.28 or 0.45)
  if (dtiRatio > 1.0) {
    dtiRatio = dtiRatio / 100.0;
  }
  dtiRatio = Math.min(1.0, Math.max(0.0, dtiRatio));

  // Interest Rate Normalization: If user entered decimal (0.075), convert to percentage (7.5%)
  if (interestRate > 0 && interestRate < 1.0) {
    interestRate = interestRate * 100.0;
  }

  // 2. Parse Binary Flags
  const isYes = (val) => {
    if (!val) return 0.0;
    const str = String(val).trim().toLowerCase();
    return (str === "yes" || str === "1" || str === "true") ? 1.0 : 0.0;
  };

  const hasMortgage = isYes(data.HasMortgage);
  const hasDependents = isYes(data.HasDependents);
  const hasCoSigner = isYes(data.HasCoSigner);

  // 3. Parse Categoricals Robustly
  const eduStr = String(data.Education || "").toLowerCase();
  const eduBachelors = eduStr.includes("bachelor") ? 1.0 : 0.0;
  const eduHighSchool = eduStr.includes("high") || eduStr.includes("school") ? 1.0 : 0.0;
  const eduMasters = eduStr.includes("master") ? 1.0 : 0.0;
  const eduPhD = eduStr.includes("phd") || eduStr.includes("doctor") ? 1.0 : 0.0;

  const empStr = String(data.EmploymentType || "").toLowerCase();
  const empFullTime = empStr.includes("full") ? 1.0 : 0.0;
  const empPartTime = empStr.includes("part") ? 1.0 : 0.0;
  const empSelf = empStr.includes("self") ? 1.0 : 0.0;
  const empUnemployed = empStr.includes("unemploy") ? 1.0 : 0.0;

  const maritalStr = String(data.MaritalStatus || "").toLowerCase();
  const maritalDivorced = maritalStr.includes("divorced") ? 1.0 : 0.0;
  const maritalMarried = maritalStr.includes("married") ? 1.0 : 0.0;
  const maritalSingle = maritalStr.includes("single") ? 1.0 : 0.0;

  const purposeStr = String(data.LoanPurpose || "").toLowerCase();
  const purposeAuto = purposeStr.includes("auto") || purposeStr.includes("car") ? 1.0 : 0.0;
  const purposeBusiness = purposeStr.includes("business") ? 1.0 : 0.0;
  const purposeEducation = purposeStr.includes("education") || purposeStr.includes("student") ? 1.0 : 0.0;
  const purposeHome = purposeStr.includes("home") || purposeStr.includes("house") || purposeStr.includes("mortgage") ? 1.0 : 0.0;
  const purposeOther = (!purposeAuto && !purposeBusiness && !purposeEducation && !purposeHome) ? 1.0 : (purposeStr.includes("other") ? 1.0 : 0.0);

  // Assemble exact 28 numeric features in exact training order
  const features = [
    age,
    income,
    loanAmount,
    creditScore,
    monthsEmployed,
    numCreditLines,
    interestRate,
    loanTerm,
    dtiRatio,
    hasMortgage,
    hasDependents,
    hasCoSigner,
    eduBachelors,
    eduHighSchool,
    eduMasters,
    eduPhD,
    empFullTime,
    empPartTime,
    empSelf,
    empUnemployed,
    maritalDivorced,
    maritalMarried,
    maritalSingle,
    purposeAuto,
    purposeBusiness,
    purposeEducation,
    purposeHome,
    purposeOther
  ];

  let rawPrediction = 0;
  let defaultProb = 0.0;
  let nonDefaultProb = 1.0;
  let modelName = "Decision Tree Classifier";

  if (modelId === "logistic_regression") {
    modelName = "Logistic Regression";
    let z = LOGISTIC_REGRESSION_MODEL.intercept;
    for (let i = 0; i < 28; i++) {
      z += LOGISTIC_REGRESSION_MODEL.coef[i] * features[i];
    }
    defaultProb = 1.0 / (1.0 + Math.exp(-z));
    nonDefaultProb = 1.0 - defaultProb;
    rawPrediction = defaultProb >= 0.5 ? 1 : 0;
  } else {
    // Default: Decision Tree Traversal
    modelName = "Decision Tree Classifier";
    let node = 0;
    const tree = DECISION_TREE_MODEL;
    while (tree.children_left[node] !== -1) {
      const fIdx = tree.feature[node];
      const thresh = tree.threshold[node];
      if (features[fIdx] <= thresh) {
        node = tree.children_left[node];
      } else {
        node = tree.children_right[node];
      }
    }
    const val = tree.value[node][0];
    const total = val[0] + val[1];
    nonDefaultProb = val[0] / total;
    defaultProb = val[1] / total;
    rawPrediction = defaultProb >= 0.5 ? 1 : 0;
  }

  // Generate risk classification & underwriting executive summary
  let riskLevel = "Low";
  let predictionLabel = "No Default (Low Risk)";
  let isDefault = false;
  let summary = "";

  if (defaultProb >= 0.5) {
    riskLevel = "High";
    predictionLabel = "Default (High Risk)";
    isDefault = true;
    summary = `Applicant exhibits a high estimated default probability of ${(defaultProb * 100).toFixed(1)}%. Key risk indicators include DTI ratio (${(dtiRatio * 100).toFixed(0)}%), FICO score (${creditScore}), or employment status (${data.EmploymentType || 'Unemployed'}).`;
  } else if (defaultProb >= 0.25) {
    riskLevel = "Moderate";
    predictionLabel = "No Default (Moderate Risk)";
    isDefault = false;
    summary = `Applicant is predicted not to default with a moderate risk score (${(defaultProb * 100).toFixed(1)}% default probability). Further manual underwriting review or collateral verification is recommended.`;
  } else {
    riskLevel = "Low";
    predictionLabel = "No Default (Low Risk)";
    isDefault = false;
    summary = `Applicant has a strong financial profile with an estimated default probability of only ${(defaultProb * 100).toFixed(1)}%. Low risk classification with favorable income-to-loan ratios.`;
  }

  return {
    model_id: modelId,
    model_name: modelName,
    prediction: rawPrediction,
    prediction_label: predictionLabel,
    is_default: isDefault,
    default_probability: parseFloat(defaultProb.toFixed(4)),
    non_default_probability: parseFloat(nonDefaultProb.toFixed(4)),
    risk_level: riskLevel,
    summary: summary,
    timestamp: new Date().toISOString()
  };
}
