# IDEA.md — Kognex

**Capstone Project 4** · AIML Summer Internship 2026 · IIHMF, MNNIT Allahabad

## Problem Statement

Kognex solves the expensive problem of employee attrition. HR teams usually notice a flight risk only after someone hands in their notice. Kognex is a predictive retention engine and binary classifier that flags employees likely to leave, using indicators like overtime, job satisfaction, income, and tenure — so intervention can happen before resignation, not after.

## Why This Idea

Fits the capstone rubric exactly (Project 4 explicitly lists Classification, Feature Selection, Data Balancing, Model Evaluation, Logistic Regression as required concepts) and fits current constraints: beginner Python, CPU-only 8GB RAM laptop, zero completed projects so far, dependency on Colab/Kaggle notebooks. The dataset is small (~1,470 rows), clean, and well-documented — a realistic first project to actually finish end-to-end rather than stall on.

## Dataset

Kaggle — **IBM HR Analytics Employee Attrition & Performance**. 1,470 rows, 35 columns, synthetic but realistic. No missing values. Target: `Attrition` (Yes/No), imbalanced roughly 1:6.

Columns to drop immediately: `EmployeeCount`, `StandardHours`, `Over18`, `EmployeeNumber` — constants or IDs, zero predictive value.

## Pipeline (mapped to the 8 mandated phases)

1. **Problem Understanding** — define attrition as the target, frame as a classification problem with business relevance.
2. **Data Collection** — pull from Kaggle, inspect schema and dtypes.
3. **Preprocessing** — drop dead columns; one-hot encode nominal categoricals (`BusinessTravel`, `JobRole`, `MaritalStatus`, `Department`); ordinal-encode `OverTime`; scale numeric features (needed for Logistic Regression, not for tree models).
4. **EDA** — univariate + bivariate analysis, correlation heatmap. Priority cross-tabs: attrition vs. `OverTime`, `JobSatisfaction`, `MonthlyIncome`, `YearsAtCompany` — these show the clearest separation in this dataset and anchor the Results chapter.
5. **Feature Engineering** — engineered ratios (income per job level, tenure per company worked); feature selection via Random Forest importances or chi-square, satisfying the rubric's explicit "Feature Selection" line item.
6. **Model Building** — train three models minimum: Logistic Regression (interpretable baseline, explicitly named in the guidelines), Random Forest, XGBoost. All light enough for CPU-only training on this row count.
7. **Evaluation** — imbalance means accuracy is misleading and shouldn't lead the report. Report Precision, Recall, F1, and ROC-AUC. Address "Data Balancing" directly via `class_weight='balanced'` or SMOTE applied only to the training split.
8. **Deployment** — Streamlit app taking employee attributes as input, returning attrition risk + probability. Deploy free via Streamlit Community Cloud for the submission's "Deployment Link" field.

## Tech Stack

- **Notebook**: Google Colab / Kaggle Notebooks (compute-agnostic, no local GPU dependency)
- **Core**: pandas, numpy, scikit-learn, xgboost, imbalanced-learn (SMOTE)
- **Visualization**: matplotlib, seaborn
- **Deployment**: Streamlit + Streamlit Community Cloud
- **Serialization**: joblib/pickle for the final model artifact

## Deliverables Checklist (per submission guidelines)

- Source code in the required folder structure: `Dataset/`, `Notebook/`, `Model/`, `Streamlit_App/`, `Documentation/`, `README.md`
- Project report, 15–25 pages, six chapters (Introduction → Literature Review → Methodology → Implementation → Results and Discussion → Conclusion and Future Scope) plus references
- Presentation, 10–15 slides
- Live demo: 10-min presentation + 5-min demo + 5-min Q&A
- Final zip named `EmployeeAttritionPrediction_<TeamLeaderName>.zip`

## Rough Timeline

| Days  | Focus                              |
| ----- | ---------------------------------- |
| 1–2   | Dataset acquisition, initial EDA   |
| 3–4   | Preprocessing, feature engineering |
| 5–7   | Model building, tuning, evaluation |
| 8–9   | Streamlit app                      |
| 10–12 | Report writing                     |
| 13–14 | Slides, demo rehearsal             |

## Risks / Watch-outs

- **Imbalance masking real performance** — must lead with F1/ROC-AUC, not accuracy, in both the report and the demo narrative.
- **Overfitting on a small dataset** — use k-fold cross-validation rather than a single train/test split for reported metrics.
- **Academic integrity clause** — the guidelines explicitly require understanding every submitted line; anything AI-assisted needs to be explainable unprompted in the Q&A session.
