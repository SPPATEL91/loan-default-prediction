import { DECISION_TREE_MODEL, LOGISTIC_REGRESSION_MODEL } from './modelsData';

export function runClientPrediction(data, modelId = "decision_tree") {
  // 1. Binary features
  const hasMortgage = String(data.HasMortgage).trim().toLowerCase() === "yes" || data.HasMortgage === 1 || data.HasMortgage === true ? 1.0 : 0.0;
  const hasDependents = String(data.HasDependents).trim().toLowerCase() === "yes" || data.HasDependents === 1 || data.HasDependents === true ? 1.0 : 0.0;
  const hasCoSigner = String(data.HasCoSigner).trim().toLowerCase() === "yes" || data.HasCoSigner === 1 || data.HasCoSigner === true ? 1.0 : 0.0;

  // 2. Exact 28 features in order
  const features = [
    parseFloat(data.Age),
    parseFloat(data.Income),
    parseFloat(data.LoanAmount),
    parseFloat(data.CreditScore),
    parseFloat(data.MonthsEmployed),
    parseFloat(data.NumCreditLines),
    parseFloat(data.InterestRate),
    parseFloat(data.LoanTerm),
    parseFloat(data.DTIRatio),
    hasMortgage,
    hasDependents,
    hasCoSigner,
    data.Education === "Bachelor's" ? 1.0 : 0.0,
    data.Education === "High School" ? 1.0 : 0.0,
    data.Education === "Master's" ? 1.0 : 0.0,
    data.Education === "PhD" ? 1.0 : 0.0,
    data.EmploymentType === "Full-time" ? 1.0 : 0.0,
    data.EmploymentType === "Part-time" ? 1.0 : 0.0,
    data.EmploymentType === "Self-employed" ? 1.0 : 0.0,
    data.EmploymentType === "Unemployed" ? 1.0 : 0.0,
    data.MaritalStatus === "Divorced" ? 1.0 : 0.0,
    data.MaritalStatus === "Married" ? 1.0 : 0.0,
    data.MaritalStatus === "Single" ? 1.0 : 0.0,
    data.LoanPurpose === "Auto" ? 1.0 : 0.0,
    data.LoanPurpose === "Business" ? 1.0 : 0.0,
    data.LoanPurpose === "Education" ? 1.0 : 0.0,
    data.LoanPurpose === "Home" ? 1.0 : 0.0,
    data.LoanPurpose === "Other" ? 1.0 : 0.0
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
    // Default: Decision Tree traversal
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

  // Generate risk level and summary
  let riskLevel = "Low";
  let predictionLabel = "No Default (Low Risk)";
  let isDefault = false;
  let summary = "";

  if (defaultProb >= 0.5) {
    riskLevel = "High";
    predictionLabel = "Default (High Risk)";
    isDefault = true;
    summary = `Applicant exhibits a high estimated default probability of ${(defaultProb * 100).toFixed(1)}%. Key risk indicators may include debt-to-income ratio (${(data.DTIRatio * 100).toFixed(0)}%), credit score (${data.CreditScore}), or employment status (${data.EmploymentType}).`;
  } else if (defaultProb >= 0.25) {
    riskLevel = "Moderate";
    predictionLabel = "No Default (Moderate Risk)";
    isDefault = false;
    summary = `Applicant is predicted not to default with a moderate risk score (${(defaultProb * 100).toFixed(1)}% default probability). Further manual underwriting review or collateral verification is recommended.`;
  } else {
    riskLevel = "Low";
    predictionLabel = "No Default (Low Risk)";
    isDefault = false;
    summary = `Applicant has a strong profile with an estimated default probability of only ${(defaultProb * 100).toFixed(1)}%. Low risk profile with favorable income-to-loan ratios.`;
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
