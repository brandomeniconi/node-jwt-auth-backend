const dotenv = require('dotenv');
const path = require('path');

// Load config vars from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });