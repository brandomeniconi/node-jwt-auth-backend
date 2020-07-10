// Required libraries
const dotenv = require('dotenv');
const express = require('express');
const cookieParser = require('cookie-parser');

// Routes
const apiRouter = require('./routes/api');
const userRouter = require('./routes/user');

// Init express
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Load config vars from .env file
dotenv.config();

app.use('/api', apiRouter);
app.use('/user', userRouter);

module.exports = app;
