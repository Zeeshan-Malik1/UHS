import ast
import csv
import json
import sys
import warnings
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np

warnings.filterwarnings("ignore")

ROOT = Path(__file__).resolve().parents[2]
MODEL_DIR = ROOT / "dataset_model"
DATA_DIR = MODEL_DIR / "dataset"

model = joblib.load(MODEL_DIR / "best_xgboost_model.pkl")
label_encoder = joblib.load(MODEL_DIR / "label_encoder.pkl")

with (DATA_DIR / "Diseases_and_Symptoms_dataset.csv").open("r", encoding="utf-8-sig", newline="") as file:
    reader = csv.reader(file)
    feature_order = next(reader)[1:]
    cooccurrence = np.zeros((len(feature_order), len(feature_order)), dtype=np.int32)
    frequency = np.zeros(len(feature_order), dtype=np.int32)
    training_rows = []
    training_diseases = []
    for row in reader:
        vector = np.fromiter((value == "1" for value in row[1:]), dtype=np.uint8, count=len(feature_order))
        training_rows.append(vector)
        training_diseases.append(row[0].strip().lower())
        active = np.flatnonzero(vector)
        if active.size == 0:
            continue
        frequency[active] += 1
        cooccurrence[np.ix_(active, active)] += 1
    training_matrix = np.stack(training_rows)
    training_diseases = np.asarray(training_diseases)

feature_index = {name.strip().lower(): index for index, name in enumerate(feature_order)}

def normalize(value):
    return str(value).strip().lower()

def load_lookup(filename, value_column):
    with (DATA_DIR / filename).open("r", encoding="utf-8-sig", newline="") as file:
        return {normalize(row["Disease"]): row.get(value_column, "") for row in csv.DictReader(file)}

descriptions = load_lookup("description.csv", "Description")
diets = load_lookup("diets.csv", "Diet")
medications = load_lookup("medications.csv", "Medication")
workouts = load_lookup("workout.csv", "Workouts")

with (DATA_DIR / "precautions.csv").open("r", encoding="utf-8-sig", newline="") as file:
    precautions = {
        normalize(row["Disease"]): [
            row.get("Precaution_1", ""),
            row.get("Precaution_2", ""),
            row.get("Precaution_3", ""),
            row.get("Precaution_4", ""),
        ]
        for row in csv.DictReader(file)
    }

def parse_list(value):
    if not value:
        return []
    try:
        parsed = ast.literal_eval(value)
        if isinstance(parsed, list):
            return [str(item).strip() for item in parsed if str(item).strip()]
    except (ValueError, SyntaxError):
        pass
    return [str(value).strip()]

def predict(selected_symptoms):
    normalized = [normalize(item) for item in selected_symptoms]
    invalid = [item for item in normalized if item not in feature_index]
    if invalid:
        raise ValueError(f"Unknown symptoms: {', '.join(invalid)}")
    vector = np.zeros(len(feature_order), dtype=np.float32)
    for symptom in normalized:
        vector[feature_index[symptom]] = 1
    probabilities = model.predict_proba(vector.reshape(1, -1))[0]
    top_indices = np.argsort(probabilities)[::-1][:3]
    predicted_index = int(top_indices[0])
    disease = str(label_encoder.inverse_transform([predicted_index])[0])
    key = normalize(disease)
    return {
        "disease": disease,
        "confidence": float(probabilities[predicted_index]),
        "topPredictions": [
            {
                "disease": str(label_encoder.inverse_transform([int(index)])[0]),
                "confidence": float(probabilities[int(index)]),
            }
            for index in top_indices
        ],
        "selectedSymptoms": normalized,
        "description": descriptions.get(key, "Not Available"),
        "diet": parse_list(diets.get(key, "")),
        "medications": parse_list(medications.get(key, "")),
        "precautions": [item for item in precautions.get(key, []) if item],
        "workout": parse_list(workouts.get(key, "")),
        "recoveryTips": [],
        "predictionDatetime": datetime.now(timezone.utc).isoformat(),
        "modelVersion": "best_xgboost_model.pkl",
    }

def suggest(selected_symptoms):
    normalized = [normalize(item) for item in selected_symptoms]
    selected_indices = [feature_index[item] for item in normalized if item in feature_index]
    if not selected_indices:
        return sorted(feature_order)
    vector = np.zeros(len(feature_order), dtype=np.float32)
    vector[selected_indices] = 1
    probabilities = model.predict_proba(vector.reshape(1, -1))[0]
    top_indices = np.argsort(probabilities)[::-1][:3]
    disease_scores = np.zeros(len(feature_order), dtype=np.float64)
    probability_total = float(probabilities[top_indices].sum())
    for class_index in top_indices:
        disease = normalize(label_encoder.inverse_transform([int(class_index)])[0])
        disease_rows = training_diseases == disease
        if np.any(disease_rows):
            weight = float(probabilities[class_index]) / max(probability_total, 1e-12)
            disease_scores += weight * training_matrix[disease_rows].mean(axis=0)

    matching_rows = np.all(training_matrix[:, selected_indices] == 1, axis=1)
    if np.any(matching_rows):
        context_scores = training_matrix[matching_rows].mean(axis=0)
    else:
        context_scores = np.zeros(len(feature_order), dtype=np.float64)
        for index in selected_indices:
            context_scores += cooccurrence[index] / max(int(frequency[index]), 1)
        context_scores /= len(selected_indices)
    scores = 0.65 * disease_scores + 0.35 * context_scores
    selected_set = set(selected_indices)
    ranked = sorted(
        (index for index in range(len(feature_order)) if index not in selected_set),
        key=lambda index: (-scores[index], feature_order[index]),
    )
    return [feature_order[index] for index in ranked]

def respond(request_id, data=None, error=None):
    print(json.dumps({"id": request_id, "data": data, "error": error}, ensure_ascii=False), flush=True)

print(json.dumps({"ready": True, "symptomCount": len(feature_order), "diseaseCount": len(label_encoder.classes_)}), flush=True)
for line in sys.stdin:
    try:
        request = json.loads(line)
        if request.get("action") == "symptoms":
            respond(request.get("id"), suggest(request.get("selected", [])))
        elif request.get("action") == "predict":
            respond(request.get("id"), predict(request.get("symptoms", [])))
        else:
            respond(request.get("id"), error="Unsupported model action")
    except Exception as error:
        respond(request.get("id") if "request" in locals() else None, error=str(error))
