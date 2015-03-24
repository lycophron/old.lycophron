/*jshint node: true*/
/**
 * @author lattmann / https://github.com/lattmann
 */

function init(server, logger, config) {
    'use strict';
    var socketIO = require('socket.io'),
        io,
        users = {},
        rooms = {},

        i,
        broadcastedMessages = ['foundWord', 'startGame'];

    logger.debug('Web sockets are initializing');

    io = socketIO.listen(server);

    io.sockets.on('connection', function (socket) {

        //logger.debug('New client connected: ' + socket.id);
        socket.emit('message', {
            message: 'Welcome to the chat',
            roomId: 'Global',
            timeStamp: (new Date()).toISOString()
        });

        sendAvailableUsers();
        sendAvailableRooms();

        socket.on('createRoom', function (room) {
            rooms[room.id] = room;

            rooms[room.id].numUsers = 0;

            sendAvailableRooms();
        });

        socket.on('joinRoom', function (roomId) {
            // TODO: handle if users are not allowed to join, only owner + allowedUsers
            if (rooms.hasOwnProperty(roomId)) {
                socket.join(roomId);
                socket.broadcast.emit('message', {message: 'multiplayer.userJoinedToRoom', user: users[socket.id].id});

                if (io.nsps['/'].adapter.rooms[roomId]) {
                    rooms[roomId].numUsers = Object.keys(io.nsps['/'].adapter.rooms[roomId]).length;
                    //logger.debug(roomId + ' has nbr of users: ' + Object.keys(io.nsps['/'].adapter.rooms[roomId]).length);
                }
            }
            sendAvailableRooms();
        });

        socket.on('leaveRoom', function (roomId) {
            if (rooms.hasOwnProperty(roomId)) {
                socket.leave(roomId);
                socket.broadcast.emit('message', {message: 'multiplayer.userLeftRoom', user: users[socket.id].id});

                if (io.nsps['/'].adapter.rooms[roomId]) {
                    rooms[roomId].numUsers = Object.keys(io.nsps['/'].adapter.rooms[roomId]).length;
                    //logger.debug(roomId + ' has nbr of users: ' + Object.keys(io.nsps['/'].adapter.rooms[roomId]).length);
                } else {
                    // if everybody left the room just delete it
                    delete rooms[roomId];
                }
                sendAvailableRooms();
            }
        });


        function createBroadcastedHandler(msgName) {
            socket.on(msgName, function (data) {
                // send to everybody in the same room
                socket.broadcast.emit(msgName, data);
            });
        }

        for (i = 0; i < broadcastedMessages.length; i += 1) {
            createBroadcastedHandler(broadcastedMessages[i]);
        }

        //
        socket.on('signIn', function (data) {
            var resData = {
                    newUser: data,
                    roomId: 'Global'
                };

            //logger.debug('user is signing in using socket io');

            // check if user is already in the list
            if (users.hasOwnProperty(socket.id)) {
                // user already here.
                return;
            }

            users[socket.id] = data;

            //logger.debug('connected users available ' + Object.keys(users).length);
            socket.broadcast.emit('userAvailable', resData);

            sendAvailableUsers();
        });

        socket.on('disconnect', function () {
            var i,
                keys = Object.keys(rooms);

            //logger.debug(socket.id + ' disconnected');


            for (i = 0; i < keys.length; i += 1) {
                // transfer room owner ship if possible
                if (io.nsps['/'].adapter.rooms[keys[i]] && io.nsps['/'].adapter.rooms[keys[i]].length > 0) {
                    rooms[keys[i]].owner = users[io.nsps['/'].adapter.rooms[keys[i]][0]].id;
                } else {
                    // remove all rooms that the user owned
                    if (users.hasOwnProperty(socket.id) &&
                        rooms[keys[i]].owner === users[socket.id].id) {
                        delete rooms[keys[i]];
                    }
                }
            }


            socket.broadcast.emit('userLeft', users[socket.id]);
            delete users[socket.id];

            sendAvailableUsers();
            sendAvailableRooms();
        });


        function sendAvailableUsers() {
            var key,
                resAllUsers = {},
                resAllUsersArr = [];

            // FIXME: this will not scale for many users well
            for (key in users) {
                if (users.hasOwnProperty(key)) {
                    resAllUsers[users[key].id] = users[key];
                }
            }

            for (key in resAllUsers) {
                resAllUsersArr.push(resAllUsers[key]);
            }

            //logger.debug('unique users available ' + resAllUsersArr.length);

            // send it to all connected clients
            io.emit('availableUsers', resAllUsersArr);
        }

        function sendAvailableRooms() {
            var key,
                resAllRooms = [];

            // FIXME: this will not scale for many users well
            for (key in rooms) {
                if (rooms.hasOwnProperty(key)) {
                    resAllRooms.push(rooms[key]);
                }
            }

            //logger.debug('unique rooms available ' + resAllRooms.length);

            // send it to all connected clients
            io.emit('availableRooms', resAllRooms);
        }

    });

    logger.debug('Web sockets are ready');
}

module.exports = {
    init: init
};