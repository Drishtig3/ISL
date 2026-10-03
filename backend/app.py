import os
import json
import webbrowser
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import model_engine

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, 'frontend')
BACKEND_DIR = os.path.join(BASE_DIR, 'backend')
HISTORY_FILE = os.path.join(BACKEND_DIR, 'history.json')

app = Flask(__name__, static_folder=FRONTEND_DIR)
CORS(app)

# Initialize seed dataset if not present
def init_seed_dataset():
    data = model_engine.load_dataset()
    if not data:
        # Check if dataset.js can provide seeds or create core gestures
        sample_dataset = {
            "Namaste": [],
            "Haan": [],
            "Nahi": [],
            "Peace / Two": [],
            "OK / Perfect": [],
            "I Love You": [],
            "Call Me": [],
            "1 (Index Finger)": [],
            "Five (5)": [],
            "Fist / Mutthi": []
        }
        model_engine.save_dataset(sample_dataset)

init_seed_dataset()

@app.route('/')
def index():
    return send_from_directory(FRONTEND_DIR, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(os.path.join(FRONTEND_DIR, path)):
        return send_from_directory(FRONTEND_DIR, path)
    return send_from_directory(FRONTEND_DIR, 'index.html')

@app.route('/api/status', methods=['GET'])
def get_status():
    dataset = model_engine.load_dataset()
    total_classes = len(dataset)
    total_samples = sum(len(samples) for samples in dataset.values())
    return jsonify({
        'status': 'online',
        'backend': 'Python Flask 3.1',
        'total_classes': total_classes,
        'total_samples': total_samples,
        'engine': '63D Scale-Invariant Centroid KNN'
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.get_json(force=True)
    landmarks = data.get('landmarks', [])
    threshold = float(data.get('threshold', 0.70))
    result = model_engine.predict_gesture(landmarks, threshold)
    return jsonify(result)

@app.route('/api/dataset', methods=['GET', 'POST'])
def handle_dataset():
    if request.method == 'GET':
        dataset = model_engine.load_dataset()
        return jsonify(dataset)
    elif request.method == 'POST':
        new_data = request.get_json(force=True)
        model_engine.save_dataset(new_data)
        return jsonify({'success': True, 'message': 'Dataset updated successfully'})

@app.route('/api/history', methods=['GET', 'POST'])
def handle_history():
    if request.method == 'GET':
        if os.path.exists(HISTORY_FILE):
            with open(HISTORY_FILE, 'r', encoding='utf-8') as f:
                history = json.load(f)
        else:
            history = []
        return jsonify(history)
    elif request.method == 'POST':
        entry = request.get_json(force=True)
        history = []
        if os.path.exists(HISTORY_FILE):
            try:
                with open(HISTORY_FILE, 'r', encoding='utf-8') as f:
                    history = json.load(f)
            except Exception:
                history = []
        history.insert(0, entry)
        # Keep last 50 entries
        history = history[:50]
        with open(HISTORY_FILE, 'w', encoding='utf-8') as f:
            json.dump(history, f, indent=2, ensure_ascii=False)
        return jsonify({'success': True, 'history': history})

def main():
    port = 8000
    print("=" * 65)
    print("   INDIAN SIGN LANGUAGE (ISL) FULL-STACK SYSTEM")
    print(f"   Frontend Directory : {FRONTEND_DIR}")
    print(f"   Backend Server     : http://localhost:{port}")
    print("=" * 65)
    
    try:
        webbrowser.open(f"http://localhost:{port}")
    except Exception:
        pass
        
    app.run(host='0.0.0.0', port=port, debug=False)

if __name__ == '__main__':
    main()
