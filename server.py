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
<<<<<<< HEAD
=======
    
    
@app.route('/send-coordinates', methods=['POST'])
def receive_coordinates():
    data = request.json
    try:
        # Serialize data to a JSON string
        data_str = json.dumps(data)

        # Start the subprocess with data passed as a command-line argument
        process = subprocess.Popen(['python3', 'palletbackendfinal.py', data_str], stdin=None, stdout=None, stderr=None, text=True) # Wait for the subprocess to complete if necessary

        if process.returncode == 0:
            return jsonify({"status": "success"}), 200
        else:
            return jsonify({"status": "error", "message": "Subprocess failed"}), 500
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
>>>>>>> ca851713aa1bccb578844e295580e1b3271cd338

if __name__ == '__main__':
    app.run(debug=True)
