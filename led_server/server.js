const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
// **************************** LED KEY ******************************
const KEY = process.env.LED_KEY || 'ledsecret123';
let led = 'OFF';
let lastSeen = 0;

const authed = (req) => (req.header('x-key') || req.query.key) === KEY;
const online = () => Date.now() - lastSeen < 8000;

// ESP32 polls this
app.get('/api/device', (req, res) => {
  if (!authed(req)) return res.status(401).send('no');
  lastSeen = Date.now();
  res.type('text').send(led);
});

// App reads status
app.get('/api/status', (req, res) => res.json({ led, online: online() }));

// App sets the LED
app.post('/api/led', (req, res) => {
  if (!authed(req)) return res.status(401).json({ error: 'bad key' });
  led = req.body.state === 'ON' ? 'ON' : 'OFF';
  res.json({ led, online: online() });
});

app.listen(process.env.PORT || 3000, () => console.log('LED server running'));