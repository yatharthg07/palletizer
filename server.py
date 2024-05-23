from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import json

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['POST'])
def unit_information():
    data = request.json
    print(data)
    
    # Call process_data.py and pass the data
    try:
        result = subprocess.run(
            ['python3', 'process_data.py'] + [str(data[key]) for key in [
                'width', 'length', 'height', 'weight', 'palletHeight', 'palletWidth', 'clearance'
            ]],
            capture_output=True,
            text=True
        )
        # Parse the output from process_data.py
        output = result.stdout
        return jsonify({"message": "Data received", "output": output}), 200
    except Exception as e:
        return jsonify({"message": "Error processing data", "error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
