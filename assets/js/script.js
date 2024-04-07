"use strick";

const apiKey = "c306c772a6e68ff8345b9519e22b1ade";
const searchInput = document.getElementById("city-name");

function createTodayWeatherCard(todayWeatherData) {
    const card = document.createElement("div");
    card.classList.add("card");

    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    const cardTitle = document.createElement("h5");
    cardTitle.classList.add("card-title");
    const todayDate = dayjs(todayWeatherData.dt * 1000).format(
        "dddd, MMMM D, YYYY"
    );
    cardTitle.textContent = todayWeatherData.name + ` (${todayDate})`;

    const cardText = document.createElement("ul");
    cardText.classList.add("remove-bullet");

    const temprture = document.createElement("li");
    temprture.textContent = `Temp: ${todayWeatherData.main.temp}°C`;

    const wind = document.createElement("li");
    wind.textContent = `Wind: ${todayWeatherData.wind.speed} km/h`;

    const humidity = document.createElement("li");
    humidity.textContent = `Humidity: ${todayWeatherData.main.humidity}%`;

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

async function search() {
    const cityName = searchInput.value;
    try {
        const city = await getCityCoord(cityName);
        if (city) {
            const todayWeatherData = await getTodayWeather(city);
            const todayWeatherCard = createTodayWeatherCard(todayWeatherData);
            const todayCardContainer = document.getElementById("today-weather");
            todayCardContainer.innerHTML = "";
            todayCardContainer.appendChild(todayWeatherCard);
        } else {
            alert("City not found");
        }
    } catch (error) {
        console.error("ERROR:" + error);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("search-btn").addEventListener("click", search);
});
