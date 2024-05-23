from flask import Flask, request, jsonify
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
@app.route('/', methods=['POST'])
def unit_information():
    data = request.json
    print(data)
    # Process the data here
    return jsonify({"message": "Data received"}), 200

if __name__ == '__main__':
    app.run(debug=True)
