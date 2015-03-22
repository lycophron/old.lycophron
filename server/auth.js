/*jshint node: true*/
/**
 * @author lattmann / https://github.com/lattmann
 */

// based on http://iao.fi/myposts/passport_google_openid_migration


function init(app, logger, config) {
    'use strict';
    var expressSession = require('express-session'),
        passport = require('passport'),

        fs = require('fs'),
        Datastore = require('nedb'),
        users = new Datastore({filename: 'users.nedb', autoload: true}),
        allowedUsers = [],

        updateAllowedUsers = function (filename) {
            try {
                allowedUsers = JSON.parse(fs.readFileSync(filename));
                logger.debug('allowed users list was updated. ' + filename);
            } catch (e) {
                logger.warn(e);
            }
        };

    if (fs.existsSync('users.json')) {
        updateAllowedUsers('users.json');
    } else {
        fs.writeFileSync('users.json', JSON.stringify(allowedUsers));
    }

    fs.watch('.', function (event, fname) {
        if (fname === 'users.json') {
            updateAllowedUsers(fname);
        }
    });

    logger.debug('Auth module is initializing');

    app.use('/', expressSession(config.sessionParameters));
    app.use('/', passport.initialize());
    app.use('/', passport.session());


    app.use(function (req, res, next) {
        if (req.isAuthenticated()) {
            // set user id, if authenticated
            res.set('X-User-Id', req.session.passport.user);
        }

        // if the request start with auth pass it along
        if (req.path.substr(0, 6) === '/auth/') {
            return next();
        }

        if (config.authentication.allowGuests) {
            // if we allow guests then we are done here
            return next();
        }

        if (req.isAuthenticated() && req.user) {
            // iwe have a valid user

            if (allowedUsers.length > 0 &&
                allowedUsers.indexOf(req.user.emails[0].value) === -1) {
                // emails filed is defined in the config
                // we have to filter
                // if current user is not on the list we just redirect him to /auth/failed
                logger.error('Invalid user ' + req.user.displayName + ' ' + req.user.emails[0].value);
                req.session.authRedirect = req.path;
                res.redirect('/auth/failed');
                return;
            } else {
                // if user on the list, pass to the next route the request
                logger.info('Successful login ' + req.user.displayName + ' ' + req.user.emails[0].value);
                return next();
            }
        }

        // user is not authenticated yet, and requested a path which is not /auth/*
        // save the requested path (redirect him after a successful login - /auth/login/success
        req.session.authRedirect = req.path;
        // redirect him to the main login page
        res.redirect('/auth/login');
    });

    // FIXME: put provider specific strategies to separate file
    // GOOGLE SPECIFIC from here
    var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
        googleStrategyConfig = {
            callbackURL: config.server.publicUrl + '/auth/google/oauth2callback'
        },

        google,
        originalAuthorizationParams;
    logger.debug('Google OAuth2 is initializing');
    if (config.authentication.GOOGLE_CLIENT_ID && config.authentication.GOOGLE_CLIENT_SECRET) {
        googleStrategyConfig.clientID = config.authentication.GOOGLE_CLIENT_ID;
        googleStrategyConfig.clientSecret = config.authentication.GOOGLE_CLIENT_SECRET;
    } else {
        throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET have to be defined config.authentication.GOOGLE_*');
    }


    google = new GoogleStrategy(googleStrategyConfig,
        function (accessToken, refreshToken, params, profile, done) {
            var userOriginal = {
                id: profile.id,
                displayName: profile.displayName,
                name: profile.name,
                emails: profile.emails
            };

            users.update({id: profile.id}, userOriginal, {upsert: true}, function (err, numReplaced) {
                users.findOne({id: profile.id}, function (err, user) {
                    if (err) {
                        return done(err);
                    }

                    // FIXME: should we check if user is null here?
                    done(null, userOriginal);
                });
            });
        }
    );

    // Monkey patch to support openid.real option
    originalAuthorizationParams = google.authorizationParams;

    google.authorizationParams = function () {
        var val = originalAuthorizationParams.apply(this, arguments);
        val['openid.realm'] = config.server.publicUrl;
        return val;
    };

    app.get('/auth/google', passport.authenticate('google', {
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ]
    }));

    app.get('/auth/google/oauth2callback',
        passport.authenticate('google', {successRedirect: '/auth/success', failureRedirect: '/auth/failed'}));

    logger.debug('Google OAuth2 is ready');
    // GOOGLE SPECIFIC ends here


    logger.debug('Adding auth strategies');
    passport.use(google);

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        users.findOne({id: id}, function (err, user) {
            if (!user) {
                return done('Could not find user', null);
            }
            delete user._id;
            delete user.__v;

            done(err, user);
        });
    });

    logger.debug('Adding generic /auth/ rules');
    app.get('/auth/success', function (req, res) {
        res.redirect(req.session.authRedirect || '/');
    });

    app.get('/auth/logout', function (req, res) {
        req.logout();
        req.session.destroy(function (err) {
            if (err) {
                logger.error(err);
            }
            res.redirect('/');
        });
    });

    app.get('/auth/', function (req, res) {
        // get first name and last name initial at least and send it back
        var responseData = {id: null, displayName: config.authentication.guestAccount};
        if (req.user) {
            users.findOne({id: req.user.id}, function (err, user) {
                if (err) {
                    res.status(500);
                    res.send(err);
                    return;
                }
                if (user) {
                    delete user._id;
                    delete user.__v;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(user));
                } else {
                    res.status(404);
                    res.send('Could not find user');
                }
            });
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(responseData));
        }
    });


    logger.debug('Auth module is ready');
}

module.exports = {
    init: init
};