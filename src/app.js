const express = require('express');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const app = express();

app.use(express.json());
app.use('/users', userRoutes);
app.use('/products', productRoutes);

module.exports = app;
