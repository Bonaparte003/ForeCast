from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json

app = Flask(__name__)
CORS(app)

@app.route('/authentications', methods=['GET'])
def send_authentications():
    return jsonify({
        'apiKey': os.getenv('FIREBASE_API_KEY'),
        'authdomain': os.getenv('FIREBASE_AUTH_DOMAIN'),
        'projectId': os.getenv('PROJECT_ID'),
        'storageBucket': os.getenv('STORAGE_BUCKET'),
        'messageId': os.getenv('MESSAGE_SENDER_ID'),
        'appId': os.getenv('APP_ID'),
        })

if __name__ == '__main__':
    app.run(port=5001)