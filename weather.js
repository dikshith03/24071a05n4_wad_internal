const apiKey = 'API_KEY';
const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const weatherCard = document.getElementById('weatherCard');
const errorMessage = document.getElementById('error-message');
const cityNameEl = document.getElementById('cityName');
const currentTempEl = document.getElementById('currentTemp');
const weatherDescEl = document.getElementById('weatherDesc');
const ctx = document.getElementById('weatherChart').getContext('2d');

let myChart = null;

const showError = (message) => {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    weatherCard.classList.add('hidden');
};

const hideError = () => {
    errorMessage.classList.add('hidden');
};

const fetchWeatherData = async (city) => {
    try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('City not found or API error');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        showError(error.message);
        return null;
    }
};

const processedData = (data) => {
    const segments = data.list.slice(0, 8);

    const labels = segments.map(item => {
        const date = new Date(item.dt * 1000);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });

    const temps = segments.map(item => item.main.temp);

    return { labels, temps, current: data.list[0] };
};

const renderChart = (labels, temps) => {
    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temps,
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                borderWidth: 2,
                tension: 0.1,
                pointBackgroundColor: '#007bff',
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    ticks: { color: '#666' },
                    grid: { color: '#eee' }
                },
                y: {
                    ticks: { color: '#666' },
                    grid: { color: '#eee' }
                }
            }
        }
    });
};

const updateUI = (data) => {
    const { labels, temps, current } = processedData(data);

    cityNameEl.textContent = data.city.name;
    currentTempEl.textContent = Math.round(current.main.temp);
    weatherDescEl.textContent = current.weather[0].description;

    renderChart(labels, temps);

    weatherCard.classList.remove('hidden');
    hideError();
};

const handleSearch = async () => {
    const city = cityInput.value.trim();
    if (!city) return;

    if (apiKey === 'YOUR_API_KEY') {
        showError('Please set your OpenWeatherMap API Key in weather.js');
        console.warn("Using mock data for demonstration because API key is missing.");
        mockDemonstration(city);
        return;
    }

    const data = await fetchWeatherData(city);
    if (data) {
        updateUI(data);
    }
};

const mockDemonstration = (city) => {
    const mockData = {
        city: { name: city || "Demo City" },
        list: Array(8).fill(0).map((_, i) => ({
            dt: Date.now() / 1000 + i * 3600 * 3,
            main: { temp: 20 + Math.random() * 5 - 2.5 },
            weather: [{ description: "partly cloudy (demo)" }]
        }))
    };
    updateUI(mockData);
    errorMessage.innerHTML = `Using Mock Data. <br> Replace 'YOUR_API_KEY' in weather.js to get real data.`;
    errorMessage.classList.remove('hidden');
    weatherCard.classList.remove('hidden');
};

searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});
