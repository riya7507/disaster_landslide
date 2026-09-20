"""
LANDGUARD — AI-Powered Landslide Early Warning & Impact Monitoring
Prototype Prediction Service CLI & Module
SIH26001
"""

import sys
import json
import math

def calculate_landslide_risk(features):
    """
    Computes landslide probability, risk category, and explainable feature contributions.
    """
    rainfall_24h = float(features.get("rainfall_24h", 45.0))
    rainfall_7d = float(features.get("rainfall_7d", 120.0))
    soil_moisture = float(features.get("soil_moisture", 65.0))
    slope_degree = float(features.get("slope_degree", 32.0))
    historical_events = int(features.get("historical_events_count", 2))
    dist_drainage = float(features.get("distance_to_drainage_m", 150.0))
    dist_fault = float(features.get("distance_to_fault_km", 4.5))

    logit = (
        -5.2
        + 0.028 * rainfall_24h
        + 0.009 * rainfall_7d
        + 0.052 * (soil_moisture - 50.0)
        + 0.085 * (slope_degree - 25.0)
        + 0.35 * historical_events
        - 0.0012 * dist_drainage
        - 0.045 * dist_fault
    )
    prob = 1.0 / (1.0 + math.exp(-max(-8.0, min(8.0, logit))))
    prob = round(prob, 4)

    if prob < 0.30:
        category = "LOW"
    elif prob < 0.60:
        category = "MODERATE"
    elif prob < 0.80:
        category = "HIGH"
    else:
        category = "CRITICAL"

    # Feature contribution breakdown (Explainable AI)
    total_raw = (
        abs(0.028 * rainfall_24h) +
        abs(0.085 * max(0, slope_degree - 20)) +
        abs(0.052 * max(0, soil_moisture - 40)) +
        abs(0.009 * rainfall_7d) +
        abs(0.35 * historical_events)
    ) or 1.0

    contributors = [
        {"feature": "Rainfall (24h/7d)", "contribution": round((0.028 * rainfall_24h + 0.009 * rainfall_7d) / total_raw * 100, 1)},
        {"feature": "Topographic Slope", "contribution": round(0.085 * max(0, slope_degree - 20) / total_raw * 100, 1)},
        {"feature": "Soil Moisture Saturation", "contribution": round(0.052 * max(0, soil_moisture - 40) / total_raw * 100, 1)},
        {"feature": "Historical Vulnerability", "contribution": round(0.35 * historical_events / total_raw * 100, 1)},
    ]

    return {
        "probability": prob,
        "risk_percentage": round(prob * 100, 1),
        "risk_category": category,
        "contributors": contributors,
        "disclaimer": "Prototype risk estimate for decision support — official geotechnical validation required."
    }

if __name__ == "__main__":
    test_input = {
        "rainfall_24h": 110.0,
        "rainfall_7d": 280.0,
        "soil_moisture": 86.0,
        "slope_degree": 42.0,
        "historical_events_count": 4
    }
    if len(sys.argv) > 1:
        test_input = json.loads(sys.argv[1])
    print(json.dumps(calculate_landslide_risk(test_input), indent=2))
