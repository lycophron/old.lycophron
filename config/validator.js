/*jshint node:true*/
/**
 * @author lattmann / https://github.com/lattmann
 * @author pmeijer / https://github.com/pmeijer
 */

var configFileName;

function throwTypeMiss(name, value, typeStr) {
    'use strict';
    var msg;
    if (configFileName) {
        msg = 'In ' + configFileName;
    } else {
        msg = 'In configuration';
    }
    msg +=  ': ' + name + ' must be a(n) ' + typeStr + '. Got: "' + value + '".';
    throw new Error(msg);
}

function assertTypeOf(name, value, type, orFalsy) {
    'use strict';
    if (orFalsy && !value) {
        return;
    }
    if (typeof value !== type) {
        throwTypeMiss(name, value, type);
    }
}

function assertObject(name, value, orFalsy) {
    'use strict';
    assertTypeOf(name, value, 'object', orFalsy);
}

function assertString(name, value, orFalsy) {
    'use strict';
    assertTypeOf(name, value, 'string', orFalsy);
}

function assertNumber(name, value, orFalsy) {
    'use strict';
    assertTypeOf(name, value, 'number', orFalsy);
}

function assertBoolean(name, value, orFalsy) {
    'use strict';
    assertTypeOf(name, value, 'boolean', orFalsy);
}

function assertArray(name, value) {
    'use strict';
    if (value instanceof Array == false) {
        throwTypeMiss(name, value, 'array');
    }
}

// We will fail as early as possible
function validateConfig (configOrFileName) {
    'use strict';
    var config;

    if (typeof configOrFileName === 'string') {
        configFileName = configOrFileName;
        config = require(configFileName);
    } else {
        config = configOrFileName;
    }

    assertObject('config', config);

    // authentication
    assertObject('config.authentication', config.authentication);
    assertBoolean('config.authentication.allowGuests', config.authentication.allowGuests);
    assertString('config.authentication.guestAccount', config.authentication.guestAccount);
    //assertString('config.authentication.logOutUrl', config.authentication.logOutUrl);
    //assertNumber('config.authentication.salts', config.authentication.salts);

    // log

    // mongo configuration
    //assertObject('config.mongo', config.mongo);
    //assertString('config.mongo.uri', config.mongo.uri);
    //assertObject('config.mongo.options', config.mongo.options);

    // rest
    //assertObject('config.rest', config.rest);
    //assertObject('config.rest.components', config.rest.components);

    // server configuration
    assertObject('config.server', config.server);
    assertString('config.server.hostname', config.server.hostname);
    assertNumber('config.server.port', config.server.port);
    //assertObject('config.server.https', config.server.https);
    //assertBoolean('config.server.https.enable', config.server.https.enable);
    //assertString('config.server.https.certificateFile', config.server.https.certificateFile);
    //assertString('config.server.https.keyFile', config.server.https.keyFile);

    // socketIO
    //assertObject('config.socketIO', config.socketIO);
    //assertArray('config.socketIO.transports', config.socketIO.transports);


    //TODO Check ranges and enumerations.
}

module.exports = validateConfig;