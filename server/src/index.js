require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const pool = require('./db');
const { geocodeCity, getCurrentWeather, getForecast, normalize } = require('./weather');
const { formatCurrentWeather, willRainToday, format3Day } = require('./helpers');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('TP Clima Bot server running'));

async function createChatIfNotExists(chatName = 'Chat') {
  const [rows] = await pool.query('SELECT id FROM chats WHERE name = ? LIMIT 1', [chatName]);
  if (rows.length) return rows[0].id;
  const [r] = await pool.query('INSERT INTO chats (name) VALUES (?)', [chatName]);
  return r.insertId;
}

async function saveMessage(chat_id, sender, text, metadata = null) {
  await pool.query(
    'INSERT INTO messages (chat_id, sender, text, metadata) VALUES (?, ?, ?, ?)',
    [chat_id, sender, text, JSON.stringify(metadata)]
  );
}

async function loadMessages(chat_id) {
  const [rows] = await pool.query(
    'SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC',
    [chat_id]
  );
  return rows;
}

app.post('/api/chats', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Falta el nombre del chat' });
    const [result] = await pool.query('INSERT INTO chats (name) VALUES (?)', [name]);
    res.json({ id: result.insertId, name });
  } catch (err) {
    console.error('Error creando chat:', err);
    res.status(500).json({ error: 'Error creando el chat' });
  }
});

app.get('/api/chats', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM chats ORDER BY created_at DESC');
  res.json(rows);
});

io.on('connection', (socket) => {
  console.log('Client connected', socket.id);

    socket.on('join_chat', async ({ chatId, chatName }) => {
    let finalChatId = chatId;

    if (finalChatId) {
        const msgs = await loadMessages(finalChatId);
        socket.join(`chat_${finalChatId}`);
        socket.emit('history', { chatId: finalChatId, messages: msgs });
        return;
    }

    const [r] = await pool.query('INSERT INTO chats (name) VALUES (?)', [chatName || 'Chat']);
    finalChatId = r.insertId;

    socket.join(`chat_${finalChatId}`);
    socket.emit('history', { chatId: finalChatId, messages: [] });
    });


  socket.on('user_message', async ({ chatId, text }) => {
    await saveMessage(chatId, 'user', text, null);

    const cityMatch = text.match(/en\s+([A-Za-zÀ-ÿ\s]+)/i);
    const city = cityMatch ? cityMatch[1].trim() : null;
    const tl = normalize(text);

    let intent = 'CURRENT';
    if (tl.match(/lluv|llover|precipit|tormenta|chaparr|agua/)) intent = 'WILL_RAIN';
    else if (tl.match(/3.*dias|tres.*dias|proximos.*dias|semana|pronostico/)) intent = '3DAY_FORECAST';
    else if (tl.match(/max|min|temperatura|frio|calor|sensacion/)) intent = 'TEMP_MINMAX';
    else if (tl.match(/humedad|viento|brisa|velocid|rafaga|aire/)) intent = 'HUM_WIND';
    else if (tl.match(/hoy|ahora|actual/)) intent = 'CURRENT';

    if (!city) {
      const ask = '¿En qué ciudad querés el pronóstico? Escribí "en (ciudad)".';
      await saveMessage(chatId, 'bot', ask, { intent: 'ASK_CITY' });
      io.to(`chat_${chatId}`).emit('bot_message', { chatId, text: ask });
      return;
    }

    try {
      const geo = await geocodeCity(city);
      if (!geo) {
        const msg = `No encontré la ciudad "${city}". Probá con otra escritura.`;
        await saveMessage(chatId, 'bot', msg, null);
        io.to(`chat_${chatId}`).emit('bot_message', { chatId, text: msg });
        return;
      }

      const current = await getCurrentWeather(geo.lat, geo.lon);
      const forecast = await getForecast(geo.lat, geo.lon);

      let reply = '';
      if (intent === 'CURRENT') reply = formatCurrentWeather(`${geo.name}, ${geo.country}`, current);
      else if (intent === 'WILL_RAIN') reply = `${formatCurrentWeather(`${geo.name}, ${geo.country}`, current)}\n${willRainToday(forecast)}`;
      else if (intent === '3DAY_FORECAST') reply = `Pronóstico 3 días para ${geo.name}, ${geo.country}:\n${format3Day(forecast)}`;
      else if (intent === 'TEMP_MINMAX') reply = `Hoy en ${geo.name}: Máx ${Math.round(current.main.temp_max)}°C - Mín ${Math.round(current.main.temp_min)}°C.`;
      else if (intent === 'HUM_WIND') reply = `Humedad ${current.main.humidity}% - Viento ${current.wind.speed} m/s en ${geo.name}.`;
      else reply = formatCurrentWeather(`${geo.name}, ${geo.country}`, current);

      await saveMessage(chatId, 'bot', reply, { intent });
      io.to(`chat_${chatId}`).emit('bot_message', { chatId, text: reply });

    } catch (err) {
      console.error('Error al consultar OpenWeatherMap:', err.response?.data || err.message);
      const msg = 'Perdón, hubo un error consultando el clima. Intentá de nuevo más tarde.';
      await saveMessage(chatId, 'bot', msg, { error: true });
      io.to(`chat_${chatId}`).emit('bot_message', { chatId, text: msg });
    }
  });
});

server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
