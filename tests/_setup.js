const dotenv = require('dotenv');
const path = require('path');

// Load test config vars from .env.test file
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });
