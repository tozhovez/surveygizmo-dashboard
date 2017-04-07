const Promise = require('bluebird');
const request = Promise.promisifyAll(require('request'));

module.exports = request;
