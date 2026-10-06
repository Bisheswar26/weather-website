// ==================================================
// WEATHERVERSE 3D
// A-FRAME WEATHER WEBSITE
// ==================================================


// ================================================
// LOCATION
// ================================================

let latitude = 12.9716;

let longitude = 77.5946;

let city = "Bengaluru";


// ================================================
// ELEMENTS
// ================================================

const cityInput =
    document.getElementById("cityInput");

const searchBtn =
    document.getElementById("searchBtn");

const locationBtn =
    document.getElementById("locationBtn");

const cityName =
    document.getElementById("cityName");

const countryName =
    document.getElementById("countryName");

const temperature =
    document.getElementById("temperature");

const condition =
    document.getElementById("condition");

const weatherIcon =
    document.getElementById("weatherIcon");

const humidity =
    document.getElementById("humidity");

const wind =
    document.getElementById("wind");

const feels =
    document.getElementById("feels");

const forecast =
    document.getElementById("forecast");

const loading =
    document.getElementById("loading");

const errorBox =
    document.getElementById("error");


// A-FRAME objects

const sky =
    document.getElementById("sky");

const sun =
    document.getElementById("sunGroup");

const moon =
    document.getElementById("moon");

const clouds =
    document.querySelectorAll(".cloud");

const rain =
    document.getElementById("rain");

const lightning =
    document.getElementById("lightning");

const scene =
    document.getElementById("scene");


// ================================================
// WEATHER INFORMATION
// ================================================

function weatherInfo(code) {

    if (code === 0)
        return ["Clear Sky", "☀️"];

    if (code === 1 ||
        code === 2)
        return ["Partly Cloudy", "🌤️"];

    if (code === 3)
        return ["Cloudy", "☁️"];

    if (code >= 45 &&
        code <= 48)
        return ["Fog", "🌫️"];

    if (code >= 51 &&
        code <= 67)
        return ["Rain", "🌧️"];

    if (code >= 71 &&
        code <= 77)
        return ["Snow", "❄️"];

    if (code >= 80 &&
        code <= 82)
        return ["Rain Shower", "🌦️"];

    if (code >= 95)
        return ["Thunderstorm", "⛈️"];

    return ["Unknown", "🌡️"];
}


// ================================================
// LOADING
// ================================================

function setLoading(value) {

    loading.style.display =
        value ? "block" : "none";
}


// ================================================
// ERROR
// ================================================

function showError(message) {

    errorBox.textContent =
        message;

    errorBox.style.display =
        "block";
}


function hideError() {

    errorBox.style.display =
        "none";
}


// ================================================
// SEARCH CITY
// ================================================

async function searchCity(name) {

    try {

        setLoading(true);

        hideError();

        const url =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`;

        const response =
            await fetch(url);

        const data =
            await response.json();

        if (!data.results ||
            data.results.length === 0) {

            throw new Error(
                "City not found"
            );
        }

        const result =
            data.results[0];

        latitude =
            result.latitude;

        longitude =
            result.longitude;

        city =
            result.name;

        await getWeather();

    }

    catch (error) {

        showError(
            "City not found. Try another city."
        );

    }

    finally {

        setLoading(false);
    }
}


// ================================================
// GET WEATHER
// ================================================

async function getWeather() {

    try {

        setLoading(true);

        hideError();

        const url =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;

        const response =
            await fetch(url);

        const data =
            await response.json();

        const current =
            data.current;


        const info =
            weatherInfo(
                current.weather_code
            );


        // ========================================
        // CURRENT WEATHER
        // ========================================

        cityName.textContent =
            city;

        temperature.textContent =
            Math.round(
                current.temperature_2m
            );

        condition.textContent =
            info[0];

        weatherIcon.textContent =
            info[1];

        humidity.textContent =
            current.relative_humidity_2m +
            "%";

        wind.textContent =
            Math.round(
                current.wind_speed_10m
            ) +
            " km/h";

        feels.textContent =
            Math.round(
                current.apparent_temperature
            ) +
            "°C";


        // ========================================
        // FORECAST
        // ========================================

        forecast.innerHTML = "";


        for (
            let i = 0;
            i < data.daily.time.length;
            i++
        ) {

            const date =
                new Date(
                    data.daily.time[i]
                );

            const day =
                date.toLocaleDateString(
                    "en-US",
                    {
                        weekday: "short"
                    }
                );

            const info =
                weatherInfo(
                    data.daily.weather_code[i]
                );

            const max =
                Math.round(
                    data.daily.temperature_2m_max[i]
                );

            const min =
                Math.round(
                    data.daily.temperature_2m_min[i]
                );


            const card =
                document.createElement("div");

            card.className =
                "day";


            card.innerHTML = `

                <div>
                    ${day}
                </div>

                <div class="day-icon">
                    ${info[1]}
                </div>

                <div class="day-temp">
                    ${max}° / ${min}°
                </div>

            `;


            forecast.appendChild(card);
        }


        // ========================================
        // UPDATE 3D WORLD
        // ========================================

        updateWorld(
            current.weather_code
        );

    }

    catch (error) {

        console.error(error);

        showError(
            "Unable to load weather."
        );

    }

    finally {

        setLoading(false);
    }
}


// ================================================
// 3D WEATHER WORLD
// ================================================

function updateWorld(code) {


    // ==========================================
    // CLEAR SKY
    // ==========================================

    if (code === 0) {

        sky.setAttribute(
            "color",
            "#55c7ff"
        );

        scene.setAttribute(
            "fog",
            "type: exponential; color: #8dd8ff; density: 0.005"
        );

        sun.setAttribute(
            "visible",
            true
        );

        moon.setAttribute(
            "visible",
            false
        );

        rain.setAttribute(
            "visible",
            false
        );

        lightning.setAttribute(
            "visible",
            false
        );

        clouds.forEach(
            cloud => {

                cloud.setAttribute(
                    "visible",
                    true
                );

                cloud.setAttribute(
                    "animation",
                    "property: position; to: 10 6 -15; dur: 20000; loop: true"
                );
            }
        );

        return;
    }


    // ==========================================
    // CLOUD / FOG
    // ==========================================

    if (
        code >= 1 &&
        code <= 48
    ) {

        sky.setAttribute(
            "color",
            "#78909c"
        );

        scene.setAttribute(
            "fog",
            "type: exponential; color: #78909c; density: 0.025"
        );

        sun.setAttribute(
            "visible",
            false
        );

        moon.setAttribute(
            "visible",
            false
        );

        rain.setAttribute(
            "visible",
            false
        );

        clouds.forEach(
            cloud => {

                cloud.setAttribute(
                    "visible",
                    true
                );
            }
        );

        return;
    }


    // ==========================================
    // RAIN
    // ==========================================

    if (
        code >= 51 &&
        code <= 82
    ) {

        sky.setAttribute(
            "color",
            "#263b46"
        );

        scene.setAttribute(
            "fog",
            "type: exponential; color: #37474f; density: 0.035"
        );

        sun.setAttribute(
            "visible",
            false
        );

        clouds.forEach(
            cloud => {

                cloud.setAttribute(
                    "visible",
                    true
                );

                cloud.setAttribute(
                    "animation",
                    "property: position; to: 10 6 -15; dur: 10000; loop: true"
                );
            }
        );


        rain.setAttribute(
            "visible",
            true
        );


        // Animate every raindrop

        document
            .querySelectorAll(".raindrop")
            .forEach(
                (drop, index) => {

                    drop.setAttribute(
                        "animation",
                        `property: position; to: ${-5 + index * 2} -1 -10; dur: ${900 + index * 150}; loop: true`
                    );

                }
            );

        return;
    }


    // ==========================================
    // THUNDERSTORM
    // ==========================================

    if (code >= 95) {

        sky.setAttribute(
            "color",
            "#111827"
        );

        scene.setAttribute(
            "fog",
            "type: exponential; color: #111827; density: 0.045"
        );

        sun.setAttribute(
            "visible",
            false
        );

        moon.setAttribute(
            "visible",
            false
        );

        clouds.forEach(
            cloud => {

                cloud.setAttribute(
                    "visible",
                    true
                );
            }
        );

        rain.setAttribute(
            "visible",
            true
        );

        lightning.setAttribute(
            "visible",
            true
        );

        startLightning();

    }

}


// ================================================
// LIGHTNING
// ================================================

function startLightning() {

    setInterval(() => {

        lightning.setAttribute(
            "visible",
            true
        );

        setTimeout(() => {

            lightning.setAttribute(
                "visible",
                false
            );

        }, 150);

    }, 3000);
}


// ================================================
// SEARCH BUTTON
// ================================================

searchBtn.addEventListener(
    "click",
    () => {

        const value =
            cityInput.value.trim();

        if (!value) {

            showError(
                "Enter a city name."
            );

            return;
        }

        searchCity(value);

    }
);


// ================================================
// ENTER KEY
// ================================================

cityInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            searchBtn.click();

        }

    }
);


// ================================================
// USER LOCATION
// ================================================

locationBtn.addEventListener(
    "click",
    () => {

        if (
            !navigator.geolocation
        ) {

            showError(
                "Geolocation is not supported."
            );

            return;
        }


        setLoading(true);


        navigator.geolocation
            .getCurrentPosition(

                async position => {

                    latitude =
                        position.coords.latitude;

                    longitude =
                        position.coords.longitude;

                    city =
                        "My Location";

                    await getWeather();

                },

                () => {

                    setLoading(false);

                    showError(
                        "Location permission denied."
                    );

                }
            );

    }
);


// ================================================
// START
// ================================================

getWeather();