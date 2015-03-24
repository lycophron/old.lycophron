/*jshint node: true*/
/**
 * @author lattmann / https://github.com/lattmann
 */

function start(config, done) {
    'use strict';

    var fs = require('fs'),
        path = require('path'),

        salts,

        winston = require('winston'),
        logger = new (winston.Logger)({
            // TODO: add transport options to configuration
            transports: [
                new (winston.transports.Console)({ level: 'silly', colorize: config.production === false, timestamp: true }),
                new (winston.transports.File)({filename: 'server.log'})
            ]
        });

    function saltsReady() {
        var express = require('express'),
            cookieParser = require('cookie-parser'),
            compression = require('compression'),

            auth = require('./auth'),
            controller = require('./controllers'),
            websockets = require('./websockets'),

            app = express(),
            server;

        logger.debug('Server is starting up ...');

        config.sessionParameters.secret = salts.sessionSecret;
        // TODO: add https
        config.server.publicUrl = 'http://' + config.server.hostname + ':' + config.server.port;

        logger.debug('Configuring application ...');
        app.use(cookieParser());
        app.use(compression({threshold: 512}));

        //app.use(function (req, res, next) {
        //    logger.debug(req.url);
        //    next();
        //});

        app.get('/favicon.ico', function (req, res, next) {
            res.writeHead(200);
            res.end();
        });

        logger.debug('Adding static file rules for build/libs/ no auth is required');
        app.use('/libs/', express.static(__dirname + '/../build/libs/'));

        logger.debug('Adding static file rules for /locales\/.+\/translation.json/ no auth is required');
        app.use(/^\/locales\/.+\/translation.json$/, function (req, res, next) {
            res.sendFile(path.normalize(path.join(__dirname, '..', 'build', req.baseUrl)));
        });

        logger.debug('No auth rules added');

        logger.debug('Adding authentication to app ...');
        auth.init(app, logger, config);

        logger.debug('Adding controllers to app ...');
        controller.init(app, logger, config);

        //mongoose.connection.once('open', function (err) {
        //console.log('Connected to db');
        logger.debug('Binding to ' + config.server.port);
        server = app.listen(config.server.port, function (err) {
            logger.info('Web server is listening on port %d', server.address().port);

            logger.debug('Adding websockets ... ', server.address().port);
            websockets.init(server, logger, config);

            done(err);
        });
        //});

    }

    // getting random secret keys
    try {
        logger.info('Trying to read salts.json ...');
        salts = JSON.parse(fs.readFileSync('salts.json', {encoding: 'utf-8'}));
        logger.info('Got salts.json content.');
        saltsReady();
    } catch (e) {
        if (e.errno && e.code === 'ENOENT') {
            require('crypto').randomBytes(48, function (ex, buf) {
                salts = {sessionSecret: buf.toString('hex')};
                fs.writeFileSync('salts.json', JSON.stringify(salts), {encoding: 'utf-8'});
                logger.info('Created salts.json');
                saltsReady();
            });
        } else {
            logger.error(e);
            done(e);
        }
    }
}

function stop(done) {
    'use strict';

    // TODO: disconnect all sockets
    // TODO: disconnect from database
    // TODO: clean up all other resources
    done(null);
}

module.exports = {
    start: start,
    stop: stop
};

if (require.main === module) {
    var configuration = require('../config');
    start(configuration, function (err) {
        'use strict';
        if (err) {
            throw err;
        }
    });
}

