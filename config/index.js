/*globals __dirname*/
/*jshint node: true*/
/**
 * @author lattmann / https://github.com/lattmann
 */

var env = process.env.NODE_ENV || 'default',
    configFilename = __dirname + '/config.' + env + '.js',
    config = require(configFilename),
    validateConfig = require(__dirname + '/validator');

validateConfig(configFilename);

module.exports = config;