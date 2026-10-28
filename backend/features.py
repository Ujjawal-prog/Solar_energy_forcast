
from datetime import datetime


REQUIRED_COLUMNS = [
    "timestamp",
    "ambient_temp_c",
    "humidity_pct",
    "solar_irradiance_wm2"
]


def prepare_features(row):
    """
    Validate and prepare one telemetry row.

    The returned feature names must be aligned with the
    actual QuickML model before real inference is enabled.
    """
    missing = [
        column for column in REQUIRED_COLUMNS
        if column not in row
    ]

    if missing:
        raise ValueError(
            f"Missing required columns: {', '.join(missing)}"
        )

    timestamp = datetime.fromisoformat(
        str(row["timestamp"]).replace("Z", "+00:00")
    )

    return {
        "timestamp": timestamp.isoformat(),
        "ambient_temp_c": float(row["ambient_temp_c"]),
        "humidity_pct": max(
            0.0, min(100.0, float(row["humidity_pct"]))
        ),
        "solar_irradiance_wm2": float(
            row["solar_irradiance_wm2"]
        )
    }
