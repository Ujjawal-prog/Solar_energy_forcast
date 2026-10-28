
def get_energy_decision(timestamp, predicted_kw):
    """
    Decide the power mode and overload status.
    """
    hour = timestamp.hour

    if predicted_kw > 160 or 18 <= hour <= 22:
        mode = "Renewable Storage Mode"
    else:
        mode = "Main Grid Mode"

    overload = predicted_kw >= 200

    return {
        "mode": mode,
        "overload": overload
    }
