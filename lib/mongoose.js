const mongoose = require('mongoose');
const { host, port, db } = require('../config/main').database;

mongoose.connect(`mongodb://${host}:${port}/${db}`);

module.exports = mongoose;
