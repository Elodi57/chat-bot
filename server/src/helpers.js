function formatCurrentWeather(cityName, current) {
  const t = Math.round(current.main?.temp || 0);
  const desc = current.weather?.[0]?.description || 'sin datos';
  const humidity = current.main?.humidity;
  const wind = current.wind?.speed;

  let feeling = '';
  if (t >= 30) feeling = '¡Hace bastante calor!';
  else if (t >= 20) feeling = 'El clima está agradable.';
  else if (t >= 10) feeling = 'Está algo fresco.';
  else feeling = 'Hace frío, abrigate bien.';

  return `En ${cityName} actualmente hay ${t}°C, ${desc}. 
Humedad del ${humidity}% y viento a ${wind} m/s. ${feeling}`;
}

function willRainToday(forecast) {
  if (!forecast?.list) return 'No tengo datos del pronóstico en este momento.';

  const next24h = forecast.list.slice(0, 8);
  const rainTotal = next24h.reduce((acc, i) => acc + (i.rain?.['3h'] || 0), 0);

  if (rainTotal > 0) {
    return `Parece que sí, se esperan lluvias (alrededor de ${rainTotal.toFixed(
      1
    )} mm proximamente). ¡No olvides el paraguas!`;
  } else {
    return `No parece que vaya a llover. 
Podés salir tranquilo/a sin paraguas.`;
  }
}

function format3Day(forecast) {
  if (!forecast?.list) return 'No tengo suficiente información para darte el pronóstico.';

  const grouped = {};
  forecast.list.forEach(i => {
    const d = new Date(i.dt * 1000).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
    });
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(i);
  });

  const days = Object.keys(grouped).slice(0, 3);
  let result = 'Así se viene el clima para los próximos días:\n\n';

  days.forEach(d => {
    const items = grouped[d];
    const temps = items.map(i => i.main.temp);
    const max = Math.max(...temps);
    const min = Math.min(...temps);
    const desc = items[0].weather[0].description;
    result += `${capitalize(d)}: Máx ${Math.round(max)}°C / Mín ${Math.round(min)}°C — ${desc}.\n`;
  });

  return result.trim();
}

// 🧩 Helper: Capitaliza la primera letra
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = { formatCurrentWeather, willRainToday, format3Day };
