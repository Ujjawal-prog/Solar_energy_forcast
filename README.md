<--------------------------------------------------------------------------------------------------------------------------------------->

# Solar Energy Forecasting & Smart Grid Management

A machine learning-based electricity demand forecasting project developed for HackSphere. The project aims to predict future electricity demand using historical telemetry data and support smarter energy management through forecasting, monitoring, and demand-based alerts.

## 1. Problem Statement

Electricity demand fluctuates throughout the day depending on consumer activity, time, and energy consumption patterns. If demand is not anticipated effectively, power grids may experience periods of high load, inefficient resource allocation, and increased pressure on available energy resources.

Traditional approaches that rely mainly on historical averages or reactive monitoring may not provide sufficiently detailed predictions for changing demand patterns.

The challenge is to develop a system that analyzes historical electricity demand data, forecasts future demand, and helps identify periods when the grid may require additional attention or energy management measures.

## 2. Project Objective

The primary objective is to develop an intelligent electricity demand forecasting solution that:

- Predicts electricity demand using historical time-series data.
- Identifies periods of elevated electricity demand.
- Supports proactive grid monitoring and energy planning.
- Provides a foundation for demand-based alerts and renewable energy storage decisions.
- Presents forecast information through a user-friendly web interface.

## 3. Proposed Solution

The proposed solution combines machine learning, a frontend interface, and a backend integration layer to create an electricity demand forecasting workflow.

The machine learning component analyzes historical telemetry data and generates demand predictions for specified timestamps. The backend connects the forecasting functionality with the frontend, processes prediction requests, and applies application-level rules. The frontend provides a visual interface for users to understand predicted demand and associated alerts.

The project consists of three major components:

1. Frontend — User interface and visualization.
2. Backend — Request handling, API integration, and application logic.
3. Machine Learning — Historical data analysis, model training, evaluation, and demand prediction.

## 4. Machine Learning Model

The machine learning component focuses on forecasting electricity demand using historical time-series data.

### Dataset

The project uses historical electricity telemetry data stored in CSV format.

- Training dataset: `train_telemetry.csv`
- Timestamp column: `timestamp`
- Target variable: `target_demand_kw`
- Forecasting frequency: Hourly

The timestamp represents the time associated with a demand observation, while `target_demand_kw` represents the electricity demand to be predicted.

### Model Development

The machine learning workflow includes:

1. Loading and analyzing historical telemetry data.
2. Preparing timestamp and target variables.
3. Training a forecasting model.
4. Evaluating prediction performance using appropriate metrics.
5. Generating predictions for requested timestamps.

A time-series forecasting pipeline using Auto ARIMA was configured and executed through Zoho QuickML.

### Model Evaluation Results

The recorded evaluation metrics for the QuickML forecasting model are:

| Metric | Value |
|---|---:|
| MAPE | 11.2109 |
| sMAPE | 11.3743 |
| MSE | 635.3234 |
| RMSE | 25.2056 |
| MSLE | 0.0195 |
| RMSLE | 0.1395 |

These metrics provide an indication of forecasting performance. Results should be interpreted in the context of the dataset, forecast horizon, and validation methodology.

### Prediction API

A QuickML prediction endpoint was tested successfully and returned an HTTP 200 response for a sample timestamp.

Example response:

```json
{
  "result": {
    "2016-06-16 05:00:00": 285.24
  }
}
```

This demonstrates the timestamp-based prediction response returned by the tested endpoint.

The locally saved model artifact and the QuickML-hosted model are separate artifacts unless explicitly connected in the implementation.

## 5. Frontend

The frontend is organized in the `skycheck/` directory.

Its purpose is to provide a user-facing interface for interacting with the electricity forecasting application.

The intended dashboard experience includes:

- Displaying predicted electricity demand.
- Visualizing demand trends over time.
- Presenting grid status and demand-related information.
- Showing alerts when configured demand thresholds are exceeded.
- Presenting battery state-of-charge information where supported.

The frontend can communicate with the backend API to retrieve prediction results and display them in an understandable format.

The exact implemented features depend on the current frontend code.

## 6. Backend

The backend serves as the integration layer between the frontend and the machine learning prediction service.

Its intended responsibilities include:

- Receiving prediction requests from the frontend.
- Validating and processing request data.
- Connecting to the configured machine learning prediction endpoint.
- Returning prediction results in a structured response.
- Applying demand-related business rules.
- Handling API errors and unsuccessful prediction requests.

The actual backend framework and implemented features should be documented according to the current backend codebase.

### Demand Management Rules

The proposed application logic includes the following conditions:

| Condition | Intended Action |
|---|---|
| Predicted demand exceeds 160 kW | Activate or recommend Renewable Storage Mode |
| Time is between 18:00 and 22:00 | Activate or recommend Renewable Storage Mode |
| Predicted demand is at least 200 kW | Trigger a Critical Overload Alert |

These rules represent application-level decisions. Their execution depends on the backend implementation and integration with the forecasting service.

The system is a software prototype and does not independently control physical power-grid equipment.

## 7. Smart Grid Dashboard

The project is designed to connect demand forecasting with understandable energy-management insights.

The planned dashboard concepts include:

- Predicted Load Curve: Displays forecast electricity demand over time.
- Grid Status Indicators: Represents demand conditions through visual status indicators.
- Demand Alerts: Notifies users when configured demand thresholds are reached.
- Battery State of Charge (SoC): Simulates battery charge levels where implemented.
- Renewable Storage Mode: Represents an application state associated with specified demand or time conditions.

Battery SoC is a simulation unless connected to a real battery telemetry source.

## 8. System Architecture

The intended application workflow is:

1. Historical telemetry data is collected and analyzed.
2. The forecasting model is trained and evaluated.
3. The prediction service generates electricity demand forecasts.
4. The backend receives requests and obtains prediction results.
5. Application rules determine relevant status indicators and alerts.

<--------------------------------------------------------------------------------------------------------------------------------------->

https://github.com/user-attachments/assets/aaa75dbd-7eb6-4bef-960b-754848585605
