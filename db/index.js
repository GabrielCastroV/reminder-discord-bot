const Database = require('better-sqlite3');
const db = new Database('bot.db');

module.exports = db;
