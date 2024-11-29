import { initializeApp as firebaseInitializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";

async function fetchFirebaseConfig() {
  try {
    const response = await fetch("http://127.0.0.1:5001/authentications");
    if (!response.ok) {
      throw new Error(`Failed to fetch Firebase config: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching Firebase config:", error);
  }
}

async function initializeAppCustom() {
  try {
    const firebaseConfig = await fetchFirebaseConfig();
    const app = firebaseInitializeApp(firebaseConfig);
    const auth = getAuth(app);

    auth.onAuthStateChanged((user) => {
      if (!user) {
        window.location.replace("login.html");
      } else {
        console.log("User logged in:", user.email);
        setTimeout(() => {
          const event = new Event('authComplete');
          document.dispatchEvent(event);
        }, 0);
      }
    });

    const logoutButton = document.getElementById("logout");
    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        signOut(auth)
          .then(() => {
            window.location = "login.html";
          })
          .catch((error) => {
            console.error("Logout error:", error);
            alert("Logout Failed");
          });
      });
    }
  } catch (error) {
    console.error("Initialization error:", error);
  }
}

initializeAppCustom();

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("query");
  const place = document.getElementById("city");
  const namehtml = document.getElementById("formatted_address");
  const Time = document.getElementById("Time");
  const temperatureElement = document.getElementById("current_tmp");
  const windSpeedElement = document.getElementById("Wind");
  const precipitationElement = document.getElementById("Precipitation");
  const humidityElement = document.getElementById("humidity");
  const ctx = document.getElementById("myChart").getContext("2d");
  const sunrise = document.getElementById("sunriseTime");
  const sunset = document.getElementById("sunsetTime");
  let updateTimeInterval;
  let myChart;

  async function fetchWeatherData(place_query) {
    let data = {
      city: place_query
    };

    try {
      let response = await fetch("http://127.0.0.1:5002/geocode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      let result = await response.json();
      let lat = result["latitude"];
      let lon = result["longitude"];
      let name = result["formatted_address"];
      namehtml.innerHTML = name;
      let data2 = {
        latitude: lat,
        longitude: lon
      };

      let response2 = await fetch("http://127.0.0.1:5002/timezone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data2)
      });
      if (!response2.ok) {
        throw new Error(`HTTP error! status: ${response2.status}`);
      }
      let result2 = await response2.json();
      let timezone = result2["timezone"];

      function updateTime() {
        let currentTime = new Date();
        let options = {
          timeZone: timezone,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        };
        let timeString = new Intl.DateTimeFormat([], options).format(currentTime);
        Time.innerHTML = timeString;
      }

      clearInterval(updateTimeInterval);
      updateTime();
      updateTimeInterval = setInterval(updateTime, 1000);

      let data3 = {
        latitude: lat,
        longitude: lon,
        timezone: timezone
      };

      let response3 = await fetch("http://127.0.0.1:5002/weather", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data3)
      });
      if (!response3.ok) {
        throw new Error(`HTTP error! status: ${response3.status}`);
      }
      let weatherData = await response3.json();

      let currentTemperature = weatherData.hourly.temperature_2m[0];
      let currentWindSpeed = weatherData.hourly.windspeed_10m[0];
      let currentPrecipitation = weatherData.hourly.precipitation_probability[0];
      let currentHumidity = weatherData.hourly.relativehumidity_2m[0];
      let sunriseTime = weatherData.daily.sunrise[0].split("T")[1];
      let sunsetTime = weatherData.daily.sunset[0].split("T")[1];

      sunrise.innerHTML = sunriseTime;
      sunset.innerHTML = sunsetTime;
      temperatureElement.innerHTML = `${currentTemperature} °C`;
      windSpeedElement.innerHTML = `${currentWindSpeed} km/h`;
      precipitationElement.innerHTML = `${currentPrecipitation} %`;
      humidityElement.innerHTML = `${currentHumidity} %`;

      let temperatures = weatherData.hourly.temperature_2m;
      let weatherCodes = weatherData.hourly.weathercode;

      const weatherIcons = {
        0: "fa-sun", 1: "fa-cloud-sun", 2: "fa-cloud", 3: "fa-cloud",
        45: "fa-smog", 48: "fa-smog", 51: "fa-cloud-rain", 
        53: "fa-cloud-rain", 55: "fa-cloud-rain", 56: "fa-cloud-showers-heavy", 
        57: "fa-cloud-showers-heavy", 61: "fa-cloud-rain", 63: "fa-cloud-rain", 
        65: "fa-cloud-showers-heavy", 66: "fa-cloud-showers-heavy", 
        67: "fa-cloud-showers-heavy", 71: "fa-snowflake", 73: "fa-snowflake", 
        75: "fa-snowflake", 77: "fa-snowflake", 80: "fa-cloud-showers-heavy", 
        81: "fa-cloud-showers-heavy", 82: "fa-cloud-showers-heavy", 
        85: "fa-snowflake", 86: "fa-snowflake", 95: "fa-bolt", 
        96: "fa-bolt", 99: "fa-bolt"
      };
      climateIcon.className = `fas ${weatherIcons[weatherCodes[0]]}`;

      const weatherDescriptions = {
        0: "Clear", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
        45: "Fog", 48: "Depositing Rime Fog", 51: "Drizzle: Light", 
        53: "Drizzle: Moderate", 55: "Drizzle: Dense", 
        56: "Freezing Drizzle: Light", 57: "Freezing Drizzle: Dense", 
        61: "Rain: Slight", 63: "Rain: Moderate", 65: "Rain: Heavy", 
        66: "Freezing Rain: Light", 67: "Freezing Rain: Heavy", 
        71: "Snowfall: Slight", 73: "Snowfall: Moderate", 
        75: "Snowfall: Heavy", 77: "Snow Grains", 
        80: "Rain Showers: Slight", 81: "Rain Showers: Moderate", 
        82: "Rain Showers: Violent", 85: "Snow Showers: Slight", 
        86: "Snow Showers: Heavy", 95: "Thunderstorm: Slight", 
        96: "Thunderstorm: Slight Hail", 99: "Thunderstorm: Heavy Hail"
      };
      if(myChart) {
        myChart.destroy();
      }

      myChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
            .map((hour) => new Date().setHours(hour, 0, 0, 0)),
          datasets: [{
            label: "Temperature (°C)",
            data: temperatures,
            backgroundColor: ["rgba(250, 250, 250, 1)"],
            borderColor: [
              "rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)", 
              "rgba(255, 206, 86, 1)", "rgba(75, 192, 192, 1)", 
              "rgba(153, 102, 255, 1)", "rgba(255, 159, 64, 1)"
            ],
            borderWidth: 2,
            fill: false
          }]
        },
        options: {
          scales: {
            x: {
              type: "time",
              time: {
                unit: "hour"
              }
            },
            y: {
              beginAtZero: true
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function (context) {
                  let label = context.dataset.label || "";
                  if (label) {
                    label += ": ";
                  }
                  label += context.parsed.y + " °C";
                  let weatherCode = weatherCodes[context.dataIndex];
                  let weatherDescription = weatherDescriptions[weatherCode] || "Unknown";
                  label += " (" + weatherDescription + ")";
                  return label;
                }
              }
            }
          }
        }
      });

    } catch (error) {
      console.log("Error fetching weather data:", error);
    }
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    let place_query = place.value;
    await fetchWeatherData(place_query);
    place.value = "";
  });

  fetchWeatherData("Kigali");
});