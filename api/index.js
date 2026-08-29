const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 3000;

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

app.get('/', (req, res) => {
  db.query('SELECT NOW() AS now', (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(`API funcionando! Hora do banco: ${results[0].now}`);
  });
});

app.listen(port, () => {
  console.log(`API rodando na porta ${port}`);
});

