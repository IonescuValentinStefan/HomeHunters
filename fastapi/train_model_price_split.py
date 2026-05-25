import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt
import os

# Load dataset_romania
df = pd.read_csv("dataset_romania.csv")

# Preprocess amenities
df['amenities'] = df['amenities'].fillna("[]").apply(eval)
all_amenities = sorted({a for sublist in df['amenities'] for a in sublist})

# Make amenities binary
for amenity in all_amenities:
    df[f'amenity_{amenity}'] = df['amenities'].apply(lambda x: int(amenity in x))

# Columns
categorical = ['propertyType', 'furnished']
numerical = ['rooms', 'bathrooms', 'surfaceArea']
amenity_cols = [f'amenity_{a}' for a in all_amenities]
features = categorical + numerical + amenity_cols
target = 'price (€)'

def train_pipeline(df_subset):
    X = df_subset[features].copy()

    # Add rooms 3 times for wighted importance
    X["rooms_x2"] = X["rooms"]
    X["rooms_x3"] = X["rooms"]

    y = df_subset[target]

    extended_features = categorical + numerical + ["rooms_x2", "rooms_x3"] + amenity_cols

    preprocessor = ColumnTransformer([
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical)
    ], remainder='passthrough')

    print("\nCategorical columns included:", categorical)

    # 100 decision trees in the Random Forest
    # 42 is a random seed for reproducibility
    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", RandomForestRegressor(n_estimators=100, random_state=42))
    ])

    # 80% training, 20% testing split
    X_train, X_test, y_train, y_test = train_test_split(X[extended_features], y, test_size=0.2, random_state=42)

    print("\nExample training data:")
    print(X_train.head())

    # Train the model
    pipeline.fit(X_train, y_train)

    # Model evaluation
    from sklearn.metrics import r2_score, mean_absolute_error

    y_pred = pipeline.predict(X_test)
    print("MAE:", mean_absolute_error(y_test, y_pred))
    print("R²:", r2_score(y_test, y_pred))

    return pipeline

# Split dataset into renting and selling
df_rent = df[df["transactionType"] == "renting"]
df_sell = df[df["transactionType"] == "selling"]

# Train models
model_rent = train_pipeline(df_rent)
model_sell = train_pipeline(df_sell)

# # Generate graphics for accuracy
# df_rent_ext = df_rent.copy()
# df_rent_ext["rooms_x2"] = df_rent_ext["rooms"]
# df_rent_ext["rooms_x3"] = df_rent_ext["rooms"]
#
# df_sell_ext = df_sell.copy()
# df_sell_ext["rooms_x2"] = df_sell_ext["rooms"]
# df_sell_ext["rooms_x3"] = df_sell_ext["rooms"]
#
# # Graphic for renting
# y_test_rent = df_rent_ext[target]
#
# print("\nInput renting model:")
# print(df_rent_ext[features + ["rooms_x2", "rooms_x3"]].head())
#
# y_pred_rent = model_rent.predict(df_rent_ext[features + ["rooms_x2", "rooms_x3"]])
# plt.figure(figsize=(8, 6))
# plt.scatter(y_test_rent, y_pred_rent, alpha=0.5)
# plt.plot([y_test_rent.min(), y_test_rent.max()], [y_test_rent.min(), y_test_rent.max()], 'r--')
# plt.xlabel("Preț real (€)")
# plt.ylabel("Preț estimat (€)")
# plt.title("Prețuri reale vs estimate – Închiriere")
# plt.grid(True)
# plt.tight_layout()
# plt.savefig("grafic_acuratete_închiriere.png")
# plt.close()
#
# # Graphic for selling
# y_test_sell = df_sell_ext[target]
#
# print("\n📦 Input selling model:")
# print(df_sell_ext[features + ["rooms_x2", "rooms_x3"]].head())
#
# y_pred_sell = model_sell.predict(df_sell_ext[features + ["rooms_x2", "rooms_x3"]])
# plt.figure(figsize=(8, 6))
# plt.scatter(y_test_sell, y_pred_sell, alpha=0.5)
# plt.plot([y_test_sell.min(), y_test_sell.max()], [y_test_sell.min(), y_test_sell.max()], 'r--')
# plt.xlabel("Preț real (€)")
# plt.ylabel("Preț estimat (€)")
# plt.title("Prețuri reale vs estimate – Vânzare")
# plt.grid(True)
# plt.tight_layout()
# plt.savefig("grafic_acuratete_vânzare.png")
# plt.close()

importances = model_rent.named_steps['regressor'].feature_importances_
feature_names = model_rent.named_steps['preprocessor'].get_feature_names_out()

# Combine and sort feature importances
importance_df = pd.DataFrame({
    'feature': feature_names,
    'importance': importances
}).sort_values(by='importance', ascending=False)

print("\n📊 Top 10 cele mai importante variabile (închiriere):")
print(importance_df.head(10))


# Save models and amenities list
os.makedirs("models", exist_ok=True)
joblib.dump((model_rent, all_amenities), "models/model_renting.pkl")
joblib.dump((model_sell, all_amenities), "models/model_selling.pkl")

print("Models were trained and saved as 'model_renting.pkl' și 'model_selling.pkl'")