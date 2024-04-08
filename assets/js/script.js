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
    card.classList.add("card", "mb-3");

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
function loadHistory() {
    const historyContainer = document.getElementById("search-history");
    historyContainer.innerHTML = "";

    let history = JSON.parse(localStorage.getItem("history")) || [];
    history.forEach((cityName) => {
        historyContainer.appendChild(createHistory(cityName));
    });
}
function createHistory(cityName) {
    const historyItem = document.createElement("div");
    historyItem.classList.add("alert", "alert-success", "alert-dismissible");

    const closeBtn = document.createElement("button");
    closeBtn.classList.add("btn-close");
    closeBtn.setAttribute("data-bs-dismiss", "alert");
    closeBtn.setAttribute("type", "button");

    const button = document.createElement("button");
    button.classList.add("btn", "text-center");
    button.setAttribute("type", "button");
    button.setAttribute("style", "width: 100%");
    button.textContent = cityName;

    historyItem.appendChild(closeBtn);
    historyItem.appendChild(button);

    return historyItem;
}

function addToHistory(cityName) {
    let history = JSON.parse(localStorage.getItem("history")) || [];
    if (history.includes(cityName)) {
        return;
    }
    history.push(cityName);
    localStorage.setItem("history", JSON.stringify(history));
}
async function search() {
    const cityName = searchInput.value;
    const city = await getCityCoord(cityName);
    if (city) {
        handleNewForecastRequest(city);
        addToHistory(city.name);
        loadHistory();
    } else {
        alert("City not found");
    }
}

function todayWeather(forecastData) {
    let todayDate = dayjs();
    let index = forecastData.list.findIndex((item) =>
        dayjs(item.dt_txt, "YYYY-MM-DD HH:mm:ss").isSame(todayDate, "day")
    );
    index = index === -1 ? 0 : index;
    return forecastData.list[index];
}
async function handleNewForecastRequest(city) {
    try {
        const forecastData = await getForecast(city);
        displayTodayWeather(forecastData, city.name);
        display5DayForecast(forecastData);

        localStorage.setItem("currentCity", city.name);
    } catch (error) {
        console.error("ERROR:" + error);
    }
}

function displayTodayWeather(forecastData, cityName) {
    // get today's weather data
    let todayWeatherData = todayWeather(forecastData);
    todayWeatherData.weather[0].icon = todayWeatherData.weather[0].icon.replace(
        "n",
        "d"
    );
    const todayWeatherCard = createWeatherCard(
        todayWeatherData,
        "dddd, MMMM D, YYYY",
        cityName
    );

    //show today's weather
    const todayCardContainer = document.getElementById("today-weather");
    todayCardContainer.innerHTML = "";
    todayCardContainer.appendChild(todayWeatherCard);
}

function display5DayForecast(forecastData) {
    // use dayjs to get the date/time of tomorrow at 9:00 AM
    let forecastDate = dayjs().add(1, "day").startOf("day").add(9, "hour");

    // show next 5 days forecast
    for (let i = 0; i < 5; i++, forecastDate = forecastDate.add(1, "day")) {
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
}

async function displayCurrentCityWeather() {
    let currentCity = localStorage.getItem("currentCity");
    if (currentCity) {
        let city = await getCityCoord(currentCity);
        handleNewForecastRequest(city);
    }
}

async function historyClicked(event) {
    if (event.target.tagName === "BUTTON") {
        if (event.target.classList.contains("btn-close")) {
            // remove the city from the history
            let history = JSON.parse(localStorage.getItem("history")) || [];
            history = history.filter(
                (cityName) => cityName !== event.target.nextSibling.textContent
            );
            localStorage.setItem("history", JSON.stringify(history));
            loadHistory();
        } else {
            // get the city weather
            const city = await getCityCoord(event.target.textContent);
            if (city) {
                handleNewForecastRequest(city);
            } else {
                alert("City not found");
            }
        }
    }
}
document.addEventListener("DOMContentLoaded", function () {
    dayjs.extend(window.dayjs_plugin_customParseFormat);
    document.getElementById("search-btn").addEventListener("click", search);
    document
        .getElementById("city-name")
        .addEventListener("keypress", function (e) {
            if (e.key === "Enter") {
                search();
            }
        });
    document
        .getElementById("search-history")
        .addEventListener("click", historyClicked);
    loadHistory();
    displayCurrentCityWeather();
});
