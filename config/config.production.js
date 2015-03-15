/*jshint node: true*/
/**
 * @author lattmann / https://github.com/lattmann
 */

var config = require('./config.default'),
    os = require('os');

config.server.hostname = os.hostname();
config.server.port = 80;

config.authentication.allowGuests = false;

module.exports = config;