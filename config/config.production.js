/*jshint node: true*/
/**
 * @author lattmann / https://github.com/lattmann
 */

var config = require('./config.default');

config.server.hostname = 'lycophron.org';
config.server.port = 80;

config.authentication.allowGuests = false;

module.exports = config;