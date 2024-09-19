export const getWeatherByCoordinates = async (lat: string, lng: string) => {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`;

  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error('Unable to fetch weather data. Please try again later.');
  }

  return await response.json();
};
