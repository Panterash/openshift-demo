const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Conectare la baza de date din OpenShift
const pool = new Pool({
  host: process.env.DB_HOST || 'mydb',
  port: 5432,
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'parola',
  database: process.env.DB_NAME || 'todoapp'
});

// Creează tabelul automat la pornire
pool.query(`
  CREATE TABLE IF NOT EXISTS mesaje (
    id SERIAL PRIMARY KEY,
    text VARCHAR(255) NOT NULL
  )
`).catch(err => console.error('Eroare DB init:', err));

// Ruta GET (Backend -> Frontend)
app.get('/api/mesaje', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mesaje ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta POST (Frontend -> Backend -> DB)
app.post('/api/mesaje', async (req, res) => {
  try {
    const { text } = req.body;
    const result = await pool.query('INSERT INTO mesaje (text) VALUES ($1) RETURNING *', [text]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Serverul ruleaza pe portul ${PORT}`));
