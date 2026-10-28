import pandas as pd

# Load competition dataset
df = pd.read_csv("train_telemetry.csv")

# Convert timestamp
df["timestamp"] = pd.to_datetime(df["timestamp"])

print("\n--- DATASET SHAPE ---")
print(df.shape)

print("\n--- COLUMN NAMES ---")
print(df.columns.tolist())

print("\n--- FIRST 5 ROWS ---")
print(df.head())

print("\n--- MISSING VALUES ---")
print(df.isnull().sum())

print("\n--- DUPLICATE ROWS ---")
print(df.duplicated().sum())

print("\n--- TARGET STATISTICS ---")
print(df["target_demand_kw"].describe())

print("\n--- TIMESTAMP RANGE ---")
print("Start:", df["timestamp"].min())
print("End:", df["timestamp"].max())

print("\n--- DATA TYPES ---")
print(df.dtypes)

print("\nDataset analysis complete!")
