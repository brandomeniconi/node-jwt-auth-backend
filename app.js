// Required libraries
const dotenv = require('dotenv');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// Routes
const apiRouter = require('./routes/api');
const usersRouter = require('./routes/users');
const { connect } = require('./lib/storage');

// Init express
const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Load config vars from .env file
dotenv.config();

connect();

app.use('/api', apiRouter);
app.use('/users', usersRouter);

module.exports = app;
