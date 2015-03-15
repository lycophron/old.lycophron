/**
 * @author lattmann / https://github.com/lattmann
 */


function getAuth(callback) {
    'use strict';
    var agent = require('superagent');

    agent.get('/auth/')
        .accept('application/json')
        .end(function (err, res) {

            callback(err, res);
        });
}

getAuth(function (err, res) {
    var userInfo = document.getElementById('userInfo');
    if (res.body) {
        userInfo.innerHTML = JSON.stringify(res.body.displayName);
    }
});