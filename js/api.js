document.getElementById("cityButton").addEventListener("click", () => {
  const city = document.getElementById("cityValues").value.trim();
  const weatherBox = document.getElementById("weather");

  if (!city) {
    return alert("Lütfen bir şehir girin!");
  }

  weatherBox.style.display = "block";
  showWeather(city);
});

function geocode(city) {
  return fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`)
    .then(res => res.json())
    .then(data => {
      if(data.length === 0) throw new Error("Şehir bulunamadı");
      return { lat: data[0].lat, lon: data[0].lon, display_name: data[0].display_name };
    });
}

function getWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Europe/Istanbul`;
  return fetch(url).then(res => res.json());
}

function getWeatherText(code) {
  switch(code) {
    case 0: return '<img src="durum/clear-day.png">';                                       // Güneşli
    case 1: return '<img src="durum/overcast-day.png">';                                    // Genellikle güneşli
    case 2: return '<img src="durum/overcast.png">';                                        // Parçalı bulutlu
    case 3: return '<img src="durum/cloudy.png">';                                          // Bulutlu
    case 45: return '<img src="durum/overcast-day-haze.png">';                              // Sisli
    case 48: return '<img src="durum/overcast-fog.png">';                                   // Yoğun sisli
    case 51: case 53: case 55: return '<img src="durum/hail.png">';                         // Çiseleme
    case 61: case 63: case 65: return '<img src="durum/overcast-day-rain.png">';            // Yağmur
    case 71: case 73: case 75: return '<img src="durum/overcast-day-sleet.png">';           // Karla karışık yağmur
    case 80: case 81: case 82: return '<img src="durum/thunderstorms-extreme-rain.png">';   // Sağanak yağmur
    case 95: case 96: case 99: return '<img src="durum/umbrella-wind.png">';                // Fırtına
    default: return "Bilinmeyen";                                                           // Null
  }
}

function showWeather(city) {
  geocode(city)
    .then(loc => getWeather(loc.lat, loc.lon).then(data => ({ loc, data })))
    .then(({ loc, data }) => {
      let html = `<h2>${loc.display_name}</h2>`;
      html += '<ul class="nav"><div class="row">';

      for(let i=0; i<7; i++){
        const date = new Date(data.daily.time[i]).toLocaleDateString("tr-TR", { weekday: "long" });
        const desc = getWeatherText(data.daily.weathercode[i]);
        html += `
          <div class="col col-14">
          <li>
            <strong>${date}</strong>
            ${desc}
            <p><span>Min:</span> ${data.daily.temperature_2m_min[i]} °C</p>
            <p><span>Max:</span> ${data.daily.temperature_2m_max[i]} °C</p>
          </li>
          </div>
        `;
      }

    document.getElementById("weather").innerHTML = html;
    })
    .catch(err => {
      console.error(err);
      document.getElementById("weather").innerHTML = `<p style="color:red;">Hava durumu alınamadı: ${err.message}</p>`;
    });
}
