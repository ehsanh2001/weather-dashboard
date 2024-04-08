"use strick";

const apiKey = "c306c772a6e68ff8345b9519e22b1ade";
const searchInput = document.getElementById("city-name");
const forecasrColumns = [
    document.getElementById("forecast-col1"),
    document.getElementById("forecast-col2"),
    document.getElementById("forecast-col3"),
    document.getElementById("forecast-col4"),
    document.getElementById("forecast-col5"),
];

function createWeatherCard(
    forcastData,
    dateFormat = "DD/MM/YYYY",
    cityName = ""
) {
    const card = document.createElement("div");
    card.classList.add("card");

    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    const cardTitle = document.createElement("h5");
    cardTitle.classList.add("card-title");
    const todayDate = dayjs(forcastData.dt * 1000).format(dateFormat);
    cardTitle.textContent = `${cityName} (${todayDate})`;

    const cardText = document.createElement("ul");
    cardText.classList.add("remove-bullet");

    const temprture = document.createElement("li");
    temprture.textContent = `Temp: ${forcastData.main.temp}°C`;

    const wind = document.createElement("li");
    wind.textContent = `Wind: ${forcastData.wind.speed} km/h`;

    const humidity = document.createElement("li");
    humidity.textContent = `Humidity: ${forcastData.main.humidity}%`;

    cardText.appendChild(temprture);
    cardText.appendChild(wind);
    cardText.appendChild(humidity);

    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardText);
    card.appendChild(cardBody);

    return card;
}

// Get a city object for coordinates
async function getCityCoord(cityName) {
    const cityCoordUrl = encodeURI(
        `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${apiKey}`
    );
    let cities;
    try {
        const response = await fetch(cityCoordUrl);
        cities = await response.json();
    } catch (error) {
        throw error;
    }

    // if there in more than one city with the same name, we will take the first one that matches the user input
    const cityIndex = cities.findIndex(
        (city) => city.name.toUpperCase() === cityName.toUpperCase()
    );
    if (cityIndex === -1) {
        return null;
    }
    return cities[cityIndex];
}

async function getTodayWeather(city) {
    const todayWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}&units=metric`;
    const todayWeatherResponse = await fetch(todayWeatherUrl);
    const todayWeatherData = await todayWeatherResponse.json();
    return todayWeatherData;
}

async function getForecast(city) {
    const weatherUrl = `http://api.openweathermap.org/data/2.5/forecast?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}&units=metric`;
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();
    return weatherData;
}

async function search() {
    const cityName = searchInput.value;
    try {
        const city = await getCityCoord(cityName);
        if (city) {
            const todayWeatherData = await getTodayWeather(city);
            const todayWeatherCard = createWeatherCard(
                todayWeatherData,
                "dddd, MMMM D, YYYY",
                todayWeatherData.name
            );
            const todayCardContainer = document.getElementById("today-weather");
            todayCardContainer.innerHTML = "";
            todayCardContainer.appendChild(todayWeatherCard);

            const forecastData = await getForecast(city);
            //the forcast data is an array of 40 objects, each object represents the weather for 3 hours
            // we will take the weather for the next 5 days at 12:00 PM
            // each day has 8 objects in the array (hence the +8 in the for loop)
            // 12PM forcast is the 5th object in the array (hence the i=5)
            //
            let forecastColumnIndex = 0;
            for (let i = 5; i < forecastData.list.length; i += 8) {
                const card = createWeatherCard(forecastData.list[i]);
                card.classList.add("forcast-color");
                forecasrColumns[forecastColumnIndex].innerHTML = "";
                forecasrColumns[forecastColumnIndex].appendChild(card);
                forecastColumnIndex++;
            }
        } else {
            alert("City not found");
        }
    } catch (error) {
        throw error;
        console.error("ERROR:" + error);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("search-btn").addEventListener("click", search);
});
