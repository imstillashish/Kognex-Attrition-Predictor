# Kognex

Kognex is a proactive predictive retention engine that acts as a binary classifier to predict employee attrition risk based on HR indicators such as overtime, job satisfaction, income, and tenure.

It fulfills the requirements for **Capstone Project 4**, predicting attrition to enable proactive intervention before resignation.

## Project Structure
The repository is organized according to the Capstone Project requirements:

- `Dataset/` — Contains the IBM HR Analytics dataset (`dataset.csv`).
- `Notebook/` — Contains `EDA_and_Modeling.ipynb` detailing the exploratory data analysis, feature engineering, and model training.
- `Model/` — Contains `train_model.py` which trains Logistic Regression, Random Forest, and XGBoost models. The best model is saved as `model.pkl`.
- `Streamlit_App/` — Contains `app.py` for the interactive UI.
- `Documentation/` — Contains the `Report_Outline.md` providing a structured outline for the project report.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Train the Model**
   Before running the app, train the model to generate the required `.pkl` file:
   ```bash
   python Model/train_model.py
   ```

3. **Run the Application**
   Launch the Streamlit app:
   ```bash
   streamlit run Streamlit_App/app.py
   ```

## Tech Stack
- **Data & ML:** pandas, numpy, scikit-learn, xgboost, imbalanced-learn
- **Visualization:** matplotlib, seaborn (in notebook)
- **Deployment:** Streamlit
