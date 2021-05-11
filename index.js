// Dependencies
require('dotenv').config();
const express = require('express');
const dashboardRoute = require('./routes/dashboard');

// The Express app
const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Route(s)
app.use('/', dashboardRoute);

// Starting web server
const port = process.env.PORT || 8080;
app.listen(port, console.log(`Listening on port ${port}`));
