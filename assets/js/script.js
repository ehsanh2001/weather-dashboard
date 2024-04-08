"use strict";

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

    // card title
    const cardTitle = document.createElement("h5");
    cardTitle.classList.add("card-title");
    const todayDate = dayjs(forcastData.dt * 1000).format(dateFormat);
    cardTitle.textContent = `${cityName} (${todayDate})`;
    // card icon
    const cardIcon = document.createElement("img");
    cardIcon.src = `http://openweathermap.org/img/wn/${forcastData.weather[0].icon}.png`;
    // card text
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
    cardBody.appendChild(cardIcon);
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

function findForcastForDate(forecastData, date) {
    let index = forecastData.list.findIndex(
        (item) => item.dt_txt === date.format("YYYY-MM-DD HH:mm:ss")
    );

    return index !== -1 ? forecastData.list[index] : null;
}
async function search() {
    const cityName = searchInput.value;
    try {
        const city = await getCityCoord(cityName);
        if (city) {
            // get today weather data
            const todayWeatherData = await getTodayWeather(city);
			
            const todayWeatherCard = createWeatherCard(
                todayWeatherData,
                "dddd, MMMM D, YYYY",
                todayWeatherData.name
            );
            const todayCardContainer = document.getElementById("today-weather");
            todayCardContainer.innerHTML = "";
            todayCardContainer.appendChild(todayWeatherCard);

			// get forecast data
            const forecastData = await getForecast(city);
            // use dayjs to get the date/time of tomorrow at 9:00 AM
            let forecastDate = dayjs()
                .add(1, "day")
                .startOf("day")
                .add(9, "hour");

            // loop through the next 5 days
            for (
                let i = 0;
                i < 5;
                i++, forecastDate = forecastDate.add(1, "day")
            ) {
                let forecast = findForcastForDate(forecastData, forecastDate);
                if (forecast) {
                    forecast.weather[0].icon = forecast.weather[0].icon.replace(
                        "n",
                        "d"
                    );

                    const card = createWeatherCard(forecast);
                    card.classList.add("forcast-color");
                    forecasrColumns[i].innerHTML = "";
                    forecasrColumns[i].appendChild(card);
                }
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
