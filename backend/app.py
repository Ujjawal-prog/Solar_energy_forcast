from werkzeug.utils import secure_filename
from flask import g
import zcatalyst_sdk
from flask import Flask, request, jsonify
from datetime import datetime
from features import prepare_features
from energy import get_energy_decision
import csv
import io
import os
import math

app = Flask(__name__)

@app.before_request
def initialize_catalyst():
    if os.getenv("X_ZOHO_CATALYST_LISTEN_PORT"):
        g.zc_app = zcatalyst_sdk.initialize(req=request)

REQUIRED_COLUMNS = [
    "timestamp",
    "ambient_temp_c",
    "humidity_pct",
    "solar_irradiance_wm2"
]

NUMERIC_COLUMNS = [
    "ambient_temp_c",
    "humidity_pct",
    "solar_irradiance_wm2"
]


@app.route("/", methods=["GET"])
def hello():
    return jsonify({
        "message": "Solar Energy Backend is running!",
        "status": "success"
    }), 200


@app.route("/upload", methods=["POST"])
def upload_csv():

    # 1. Check whether a file was submitted
    if "file" not in request.files:
        return jsonify({
            "error": "Please upload a CSV using the field name 'file'."
        }), 400

    file = request.files["file"]
    
    if not file.filename:
        return jsonify({"error": "No file selected."}), 400

    if not file.filename.lower().endswith(".csv"):
        return jsonify({"error": "Only CSV files are allowed."}), 400

    # Read the original CSV after validation
    file_bytes = file.read()
    file.stream.seek(0)

    # Keep the rest of your existing CSV-processing code below

    try:
        # 2. Read the CSV
        content = file.stream.read().decode("utf-8-sig")
        reader = csv.DictReader(io.StringIO(content))

        if not reader.fieldnames:
            return jsonify({"error": "The CSV is empty."}), 400

        # 3. Validate required columns
        headers = [h.strip() for h in reader.fieldnames]
        missing = [
            col for col in REQUIRED_COLUMNS
            if col not in headers
        ]

        if missing:
            return jsonify({
                "error": "Required columns are missing.",
                "missing_columns": missing
            }), 400

        rows = []
        dropped_timestamps = 0

        # 4. Parse timestamps and numeric values
        for original in reader:
            row = {
                key.strip(): value
                for key, value in original.items()
                if key is not None
            }

            timestamp = (row.get("timestamp") or "").strip()

            try:
                datetime.fromisoformat(
                    timestamp.replace("Z", "+00:00")
                )
            except (ValueError, TypeError):
                dropped_timestamps += 1
                continue

            clean = {"timestamp": timestamp}

            for col in NUMERIC_COLUMNS:
                value = (row.get(col) or "").strip()

                try:
                    number = float(value)
                    if not math.isfinite(number):
                        number = None
                except (ValueError, TypeError):
                    number = None

                clean[col] = number

            rows.append(clean)

        if not rows:
            return jsonify({
                "error": "No rows with valid timestamps were found.",
                "dropped_timestamps": dropped_timestamps
            }), 400

        # 5. Fill missing numbers using each column's mean
        for col in NUMERIC_COLUMNS:
            valid = [
                row[col] for row in rows
                if row[col] is not None
            ]

            mean = sum(valid) / len(valid) if valid else 0.0

            for row in rows:
                if row[col] is None:
                    row[col] = mean

        # 6. Clamp humidity to the range 0–100
        for row in rows:
            row["humidity_pct"] = max(
                0.0,
                min(100.0, row["humidity_pct"])
            )

        # 1. Your existing CSV validation and cleaning code
# ... rows, dropped_timestamps, etc.

# 2. Step 3: Save the original CSV to Stratus
storage_status = "local_only"

if hasattr(g, "zc_app"):
    try:
        safe_name = secure_filename(file.filename)

        if not safe_name:
            safe_name = "upload.csv"

        object_key = (
            datetime.now().strftime("%Y%m%d_%H%M%S_%f")
            + "_"
            + safe_name
        )

        bucket = g.zc_app.stratus().bucket("energy-telemetry")

        bucket.put_object(
            object_key,
            io.BytesIO(file_bytes),
            {"content_type": "text/csv"}
        )

        storage_status = "saved_to_stratus"

    except Exception:
        app.logger.exception("Stratus upload failed")

        return jsonify({
            "error": "CSV was processed, but saving to Stratus failed."
        }), 502
    
        return jsonify({
            "status": "success",
            "message": "CSV validated and cleaned.",
            "rows_processed": len(rows),
            "dropped_timestamps": dropped_timestamps,
            "data": rows
        }), 200

    except UnicodeDecodeError:
        return jsonify({
            "error": "The CSV must be UTF-8 encoded."
        }), 400

    except Exception:
        app.logger.exception("CSV upload failed")
        return jsonify({
            "error": "An unexpected error occurred while processing the CSV."
        }), 500

def mock_predict_kw(features):
    """
    TEMPORARY MOCK PREDICTOR.
    Replace with the real QuickML API call later.
    This does NOT predict actual energy demand.
    """
    return 150.0


@app.route("/forecast", methods=["POST"])
def forecast():
    # 1. Read the JSON request
    body = request.get_json(silent=True)

    if not isinstance(body, dict):
        return jsonify({
            "error": "Send a valid JSON object."
        }), 400

    rows = body.get("data")

    if not isinstance(rows, list):
        return jsonify({
            "error": "JSON must contain a 'data' array."
        }), 400

    # 2. We need exactly 24 hourly rows
    if len(rows) != 24:
        return jsonify({
            "error": "Exactly 24 hourly rows are required.",
            "received_rows": len(rows)
        }), 400

    results = []

    # 3. Process every forecast row
    for index, row in enumerate(rows):
        if not isinstance(row, dict):
            return jsonify({
                "error": f"Row {index + 1} must be a JSON object."
            }), 400

        try:
            features = prepare_features(row)

            # Check that numeric features are finite
            for column in [
                "ambient_temp_c",
                "humidity_pct",
                "solar_irradiance_wm2"
            ]:
                if not math.isfinite(features[column]):
                    raise ValueError(
                        f"{column} must be a finite number."
                    )

            timestamp = datetime.fromisoformat(
                features["timestamp"]
            )

            # 4. Temporary prediction until QuickML is connected
            predicted_kw = mock_predict_kw(features)

            # 5. Apply the existing energy decision logic
            decision = get_energy_decision(
                timestamp,
                predicted_kw
            )

            results.append({
                "timestamp": features["timestamp"],
                "predicted_kw": predicted_kw,
                "mode": decision["mode"],
                "overload": decision["overload"],
                "soc": None
            })

        except (ValueError, TypeError, KeyError) as error:
            return jsonify({
                "error": f"Invalid data in row {index + 1}: {str(error)}"
            }), 400

    # 6. Return all 24 results
    return jsonify({
        "status": "success",
        "prediction_source": "mock",
        "message": (
            "Mock results only. QuickML is not connected yet."
        ),
        "results": results
    }), 200


@app.route("/outage", methods=["POST"])
def outage():
    body = request.get_json(silent=True)

    if not isinstance(body, dict):
        return jsonify({
            "error": "Send a valid JSON object."
        }), 400

    timestamp = body.get("timestamp")
    message = body.get("message", "Power outage reported.")

    if not timestamp:
        return jsonify({
            "error": "The 'timestamp' field is required."
        }), 400

    try:
        parsed_timestamp = datetime.fromisoformat(
            str(timestamp).replace("Z", "+00:00")
        )
    except ValueError:
        return jsonify({
            "error": "Invalid timestamp. Use ISO format, e.g. 2026-10-29T18:00:00."
        }), 400

    return jsonify({
        "status": "success",
        "message": "Outage received.",
        "outage": {
            "timestamp": parsed_timestamp.isoformat(),
            "details": str(message)
        }
    }), 200

if __name__ == "__main__":
    port = int(os.getenv("X_ZOHO_CATALYST_LISTEN_PORT", 9000))
    app.run(host="0.0.0.0", port=port)
