import json
import math
import os

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_FILE = os.path.join(BACKEND_DIR, 'dataset.json')

def extract_features(landmarks):
    """
    Extract 63D scale-invariant normalized coordinates.
    Formula: f_i = (P_i - P_0) / ||P_9 - P_0||
    """
    if not landmarks or len(landmarks) < 21:
        return None
    
    p0 = landmarks[0] # Wrist
    p9 = landmarks[9] # Middle finger MCP
    
    # Palm scale
    dx = p9['x'] - p0['x']
    dy = p9['y'] - p0['y']
    dz = p9.get('z', 0) - p0.get('z', 0)
    palm_scale = math.sqrt(dx*dx + dy*dy + dz*dz)
    if palm_scale < 1e-4:
        palm_scale = 1.0

    features = []
    for p in landmarks:
        features.append((p['x'] - p0['x']) / palm_scale)
        features.append((p['y'] - p0['y']) / palm_scale)
        features.append((p.get('z', 0) - p0.get('z', 0)) / palm_scale)
    return features

def cosine_similarity(v1, v2):
    if len(v1) != len(v2):
        return 0.0
    dot = sum(a * b for a, b in zip(v1, v2))
    norm_a = math.sqrt(sum(a * a for a in v1))
    norm_b = math.sqrt(sum(b * b for b in v2))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)

def load_dataset():
    if os.path.exists(DATASET_FILE):
        try:
            with open(DATASET_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return {}

def save_dataset(data):
    with open(DATASET_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def predict_gesture(landmarks, threshold=0.70):
    features = extract_features(landmarks)
    if not features:
        return {'detected': False, 'label': 'No Hand', 'confidence': 0.0}
    
    dataset = load_dataset()
    best_label = None
    best_score = -1.0
    
    for label, samples in dataset.items():
        if not samples:
            continue
        # Average centroid or best sample matching
        for sample in samples:
            score = cosine_similarity(features, sample)
            if score > best_score:
                best_score = score
                best_label = label
                
    if best_label and best_score >= threshold:
        return {
            'detected': True,
            'label': best_label,
            'confidence': round(best_score * 100, 1),
            'raw_score': best_score
        }
    else:
        return {
            'detected': False,
            'label': 'Unknown / Aligning',
            'confidence': round(max(0.0, best_score * 100), 1),
            'raw_score': best_score
        }
