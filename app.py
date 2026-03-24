import os
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')

if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

if not os.listdir(DATA_DIR):
    with open(os.path.join(DATA_DIR, 'привет.txt'), 'w', encoding='utf-8') as f:
        f.write("Привет! Это твой первый файл в редакторе 'Импортозамещение'.\nУдачи)))")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/files', methods=['GET'])
def list_files():
    try:
        files = [f for f in os.listdir(DATA_DIR) if os.path.isfile(os.path.join(DATA_DIR, f))]
        return jsonify({"files": files})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/read/<filename>', methods=['GET'])
def read_file(filename):
    if '..' in filename or filename.startswith('/'):
        return jsonify({"error": "Доступ запрещен"}), 403
    
    file_path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(file_path):
        return jsonify({"error": "Файл не найден"}), 404
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return jsonify({"content": content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/save', methods=['POST'])
def save_file():
    data = request.json
    filename = data.get('filename')
    content = data.get('content')
    
    if not filename:
        return jsonify({"error": "Имя файла не указано"}), 400
    
    if '..' in filename or filename.startswith('/'):
        return jsonify({"error": "Доступ запрещен"}), 403
    
    file_path = os.path.join(DATA_DIR, filename)
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return jsonify({"message": "Файл успешно сохранен"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
