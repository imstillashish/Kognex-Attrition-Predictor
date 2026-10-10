import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os
import xgboost as xgb
from sklearn.preprocessing import LabelEncoder
from matplotlib.colors import LinearSegmentedColormap

# Setup matplotlib style for 'dope.security' midnight terminal theme
plt.style.use('dark_background')
colors = ['#af50ff', '#f7f9fa', '#828384']
sns.set_palette(sns.color_palette(colors))
plt.rcParams['axes.facecolor'] = '#090909'
plt.rcParams['figure.facecolor'] = '#090909'
plt.rcParams['text.color'] = '#f7f9fa'
plt.rcParams['axes.labelcolor'] = '#f7f9fa'
plt.rcParams['xtick.color'] = '#f7f9fa'
plt.rcParams['ytick.color'] = '#f7f9fa'
plt.rcParams['grid.color'] = '#474747'

os.makedirs('Documentation/report/figures', exist_ok=True)

# 1. Load Data
df = pd.read_csv('Dataset/dataset.csv')

# 2. Plot EDA OverTime
plt.figure(figsize=(8, 5))
ax = sns.countplot(x='OverTime', hue='Attrition', data=df, palette=['#828384', '#af50ff'])
plt.title('Attrition Rates Segmented by OverTime Status', fontsize=14, pad=15)
plt.xlabel('OverTime', fontsize=12)
plt.ylabel('Employee Count', fontsize=12)
plt.legend(title='Attrition', frameon=False)
plt.tight_layout()
plt.savefig('Documentation/report/figures/eda_overtime.png', dpi=300, bbox_inches='tight')
plt.close()

# 3. Train XGBoost to get Feature Importances
# Preprocessing similar to methodology
df_clean = df.drop(['EmployeeCount', 'StandardHours', 'Over18', 'EmployeeNumber'], axis=1)

# Encode categorical variables
cat_cols = df_clean.select_dtypes(include=['object']).columns
le = LabelEncoder()
for col in cat_cols:
    df_clean[col] = le.fit_transform(df_clean[col])

X = df_clean.drop('Attrition', axis=1)
y = df_clean['Attrition']

# Train XGBoost
model = xgb.XGBClassifier(random_state=42, eval_metric='logloss')
model.fit(X, y)

# Get feature importances
importances = model.feature_importances_
feature_names = X.columns
feat_imp_df = pd.DataFrame({'Feature': feature_names, 'Importance': importances})
feat_imp_df = feat_imp_df.sort_values(by='Importance', ascending=False).head(10)

# 4. Plot Feature Importances
plt.figure(figsize=(10, 6))
sns.barplot(x='Importance', y='Feature', data=feat_imp_df, color='#af50ff')
plt.title('Top 10 Most Important Features (XGBoost)', fontsize=14, pad=15)
plt.xlabel('Relative Importance', fontsize=12)
plt.ylabel('')
plt.tight_layout()
plt.savefig('Documentation/report/figures/feature_importance.png', dpi=300, bbox_inches='tight')
plt.close()

print("Figures eda_overtime.png and feature_importance.png generated successfully.")
