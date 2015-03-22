/*jshint node: true*/
/**
 * @author lattmann / https://github.com/lattmann
 */


var config = {};

config.production = false;

config.server = {};
config.server.hostname = 'localhost';
config.server.port = 8100;

config.sessionParameters = {};
config.sessionParameters.resave = false;
config.sessionParameters.saveUninitialized = false;
config.sessionParameters.secret = null; // DO NOT SET THIS!

config.authentication = {};
config.authentication.allowGuests = true;
config.authentication.guestAccount = 'anonymous';


config.authentication.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
config.authentication.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

module.exports = config;