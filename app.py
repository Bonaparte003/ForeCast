from flask import Flask, request, jsonify
import urllib.request
import json
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/geocode', methods=['POST'])
def geocode():
    json_data = request.get_json()
    city = json_data.get('city')
    print(city)
    if not city:
        return jsonify({'error': 'City  is required'}), 400

    geo_url = f'https://maps.googleapis.com/maps/api/geocode/json?address={city}&key={os.getenv("GOOGLE_API_KEY")}'
    try:
        with urllib.request.urlopen(geo_url) as response:
            json_data = response.read()
            geolocation = json.loads(json_data)
        
        if not geolocation['results']:
            return jsonify({'error': 'City not found'}), 404

        result = geolocation['results'][0]
        name = result['formatted_address']
        latitude = result['geometry']['location']['lat']
        longitude = result['geometry']['location']['lng']

        return jsonify({
            'formatted_address': name,
            'latitude': latitude,
            'longitude': longitude
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/timezone', methods=['POST'])
def timezone():
    json_data = request.get_json()
    latitude = json_data.get('latitude')
    longitude = json_data.get('longitude')
    print(latitude, longitude)
    api_key = os.getenv('TIMEZONE_API_KEY')
    if not latitude or not longitude:
        return jsonify({'error': 'Latitude and longitude parameters are required'}), 400

    timezone_url = f'http://api.timezonedb.com/v2.1/get-time-zone?key={api_key}&format=json&by=position&lat={latitude}&lng={longitude}'
    try:
        with urllib.request.urlopen(timezone_url) as response:
            json_data = response.read()
            timezone_info = json.loads(json_data)
        print(timezone_info)
        timezone = timezone_info['zoneName']
        time_info = {"timezone": timezone}
        return jsonify(time_info)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/weather', methods=['POST'])
def weather():
    json_data = request.get_json()
    latitude = json_data.get('latitude')
    longitude = json_data.get('longitude')
    timezone = json_data.get('timezone')
    if not latitude or not longitude or not timezone:
        return jsonify({'error': 'Latitude, longitude, and timezone parameters are required'}), 400

    weather_url = f'https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&hourly=temperature_2m,weathercode,windspeed_10m,relativehumidity_2m,precipitation_probability&daily=sunrise,sunset&timezone={timezone}'
    try:
        with urllib.request.urlopen(weather_url) as response:
            json_data = response.read()
            weather_info = json.loads(json_data)
        print(weather_info)
        return jsonify(weather_info)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5002)