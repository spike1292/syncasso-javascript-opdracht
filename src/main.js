window.addEventListener("load", async () => {
  const openWeatherMapApiKey = "8ebf4f448fb0db23d24e285b5683d1bb";
  const tempatureDescription = document.querySelector(
    ".temperature-description"
  );
  const tempatureDegree = document.querySelector(".temperature-degree");
  const locationTimezone = document.querySelector(".location-timezone");
  const locationCity = document.querySelector(".location-city");
  /**
   * @type HTMLImageElement
   */
  const iconElement = document.querySelector(".icon");
  const degreeSection = document.querySelector(".degree-section");
  const degreeSymbol = degreeSection.querySelector(".temperature-symbol");

  // Timezone achterhalen
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  locationTimezone.textContent = timezone;

  try {
    const position = await getPosition();
    const { longitude: long, latitude: lat } = position.coords;
    await updateWeatherInformation(lat, long);

    degreeSection.addEventListener("click", async () => {
      if (degreeSymbol.textContent.includes("C")) {
        await updateWeatherInformation(lat, long, "imperial");
        degreeSymbol.innerHTML = "&deg;F";
      } else {
        await updateWeatherInformation(lat, long, "metric");
        degreeSymbol.innerHTML = "&deg;C";
      }
    });
  } catch (e) {
    if (e instanceof GeolocationPositionError) {
      alert(
        `Het is niet gelukt om je locatie op te halen. Zet locatie aan om gebruik te maken van deze pagina`
      );
    } else {
      alert("Oeps er is iets mis gegaan, zie de console");
    }

    console.error(e);
  }

  /**
   * Make `navigator.geolocation.getCurrentPosition` usable with async/wait
   * @param {PositionOptions} options
   * @returns {Promise<GeolocationPosition>}
   */
  function getPosition(options) {
    return new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, options)
    );
  }

  /**
   *
   * @param {number} lat
   * @param {number} long
   * @param {UnitOfMeasurement} unit
   */
  async function updateWeatherInformation(lat, long, unit = "metric") {
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${openWeatherMapApiKey}&lang=nl&units=${unit}`;
    const currentWeatherResponse = await fetch(currentWeatherUrl).then(
      (response) => response.json()
    );
    const { description, icon } = currentWeatherResponse.weather[0];
    setWeatherInformation(
      currentWeatherResponse.main.temp,
      description,
      currentWeatherResponse.name
    );
    setIcon(icon);
  }

  /**
   *
   * @param {number} temp
   * @param {string} description
   * @param {string} city
   */
  function setWeatherInformation(temp, description, city) {
    tempatureDegree.textContent = temp;
    tempatureDescription.textContent = description;
    locationCity.textContent = city;
  }

  /**
   *
   * @param {string} weatherMapIcon
   */
  function setIcon(weatherMapIcon) {
    iconElement.crossOrigin = "anonymous";
    iconElement.src = `https://openweathermap.org/img/wn/${weatherMapIcon}@2x.png`;
  }

  /**
   * standard = Kelvin
   * metric = Celsius
   * imperial = Fahrenheit
   * @typedef {'standard'|'metric'|'imperial'} UnitOfMeasurement
   */
});
