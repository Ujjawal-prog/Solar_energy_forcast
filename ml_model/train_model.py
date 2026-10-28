import pandas as pd
import numpy as np
import joblib

from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, ExtraTreesRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error

# 1. Load competition dataset
df = pd.read_csv("train_telemetry.csv")

# 2. Clean and prepare data
df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")

df = df.dropna(subset=[
    "timestamp",
    "ambient_temp_c",
    "humidity_pct",
    "solar_irradiance_wm2",
    "target_demand_kw"
])

df = df.sort_values("timestamp").reset_index(drop=True)

# 3. Feature engineering
df["hour"] = df["timestamp"].dt.hour
df["day_of_week"] = df["timestamp"].dt.dayofweek
df["month"] = df["timestamp"].dt.month
df["day_of_year"] = df["timestamp"].dt.dayofyear
df["is_weekend"] = (df["day_of_week"] >= 5).astype(int)

features = [
    "ambient_temp_c",
    "humidity_pct",
    "solar_irradiance_wm2",
    "hour",
    "day_of_week",
    "month",
    "day_of_year",
    "is_weekend"
]

X = df[features]
y = df["target_demand_kw"]

# 4. Time-based split: earlier data for training,
#    later data for testing
split = int(len(df) * 0.8)

X_train = X.iloc[:split]
X_test = X.iloc[split:]
y_train = y.iloc[:split]
y_test = y.iloc[split:]

# 5. Compare regression models
models = {
    "Linear Regression": LinearRegression(),
    "Random Forest": RandomForestRegressor(
        n_estimators=200,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    ),
    "Extra Trees": ExtraTreesRegressor(
        n_estimators=200,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
}

results = []

for name, model in models.items():
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    rmse = np.sqrt(mean_squared_error(y_test, predictions))
    mae = mean_absolute_error(y_test, predictions)

    results.append({
        "Model": name,
        "RMSE": rmse,
        "MAE": mae
    })

    print(f"\n{name}")
    print(f"RMSE: {rmse:.3f}")
    print(f"MAE:  {mae:.3f}")

# 6. Select model with lowest RMSE
results_df = pd.DataFrame(results).sort_values("RMSE")
print("\n--- MODEL COMPARISON ---")
print(results_df.to_string(index=False))

best_name = results_df.iloc[0]["Model"]
best_model = models[best_name]

# 7. Save model and its feature configuration
artifact = {
    "model": best_model,
    "features": features
}

joblib.dump(artifact, "best_model.pkl")

print(f"\nBest model: {best_name}")
print("Saved: best_model.pkl")
print("\nModel training complete!")