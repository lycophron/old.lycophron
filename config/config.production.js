/*jshint node: true*/
/**
 * @author lattmann / https://github.com/lattmann
 */

var config = require('./config.default'),
    os = require('os');

config.production = true;

config.server.hostname = os.hostname();
config.server.port = 8001;
config.server.publicUrl = 'https://old.lycophron.org';

config.authentication.allowGuests = false;

module.exports = config;
