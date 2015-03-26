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

            rooms[room.id].users = [];

            sendAvailableRooms();
        });

        socket.on('joinRoom', function (roomId) {
            // TODO: handle if users are not allowed to join, only owner + allowedUsers
            if (rooms.hasOwnProperty(roomId)) {
                socket.join(roomId);
                socket.broadcast.emit('message', {message: 'multiplayer.userJoinedToRoom', user: users[socket.id]});

                if (io.nsps['/'].adapter.rooms[roomId]) {
                    updateUserListInRoom(roomId);
                    //logger.debug(roomId + ' has nbr of users: ' + Object.keys(io.nsps['/'].adapter.rooms[roomId]).length);
                }

                sendAvailableRooms();
            }
        });

        socket.on('leaveRoom', function (roomId) {
            if (rooms.hasOwnProperty(roomId)) {
                socket.leave(roomId);
                socket.broadcast.emit('message', {message: 'multiplayer.userLeftRoom', user: users[socket.id]});

                if (io.nsps['/'].adapter.rooms[roomId]) {
                    updateUserListInRoom(roomId);
                    //logger.debug(roomId + ' has nbr of users: ' + Object.keys(io.nsps['/'].adapter.rooms[roomId]).length);
                } else if (users.hasOwnProperty(socket.id) && users[socket.id].id === rooms[roomId].owner.id) {
                    // if everybody left the room just delete it and the owner left lastly
                    //logger.debug('deleting room: ' + roomId);
                    delete rooms[roomId];
                } else {
                    updateUserListInRoom(roomId);
                }
                sendAvailableRooms();
            }
        });

        socket.on('roomStateUpdate', function (data) {
            var roomId = data.roomId,
                roomUpdate = data.roomUpdate,
                room = rooms[data.roomId],
                user = users[socket.id],
                key;

            if (room && user /*&& room.owner.id === user.id*/) {
                // accept updates only from owner of the room
                for (key in roomUpdate) {
                    if (roomUpdate.hasOwnProperty(key)) {
                        room[key] = roomUpdate[key];
                    }
                }

                //logger.debug(roomId + ' state updated.');

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
                if (io.nsps['/'].adapter.rooms[keys[i]] && Object.keys(io.nsps['/'].adapter.rooms[keys[i]]).length > 0) {
                    rooms[keys[i]].owner = users[Object.keys(io.nsps['/'].adapter.rooms[keys[i]])[0]];
                    updateUserListInRoom(keys[i]);
                    if (rooms[keys[i]].owner) {
                        //logger.debug('transferred user\'s room to: ' + rooms[keys[i]].owner.id + ' roomid: ' + keys[i]);
                    } else {
                        if (users.hasOwnProperty(socket.id) &&
                            rooms[keys[i]].owner.id === users[socket.id].id) {
                            //logger.debug('deleting user\'s room, was not able to reassign: ' + users[socket.id].id + ' roomid: ' + keys[i]);
                            delete rooms[keys[i]];
                        }
                    }
                } else {
                    // remove all rooms that the user owned
                    if (users.hasOwnProperty(socket.id) &&
                        rooms[keys[i]].owner.id === users[socket.id].id) {
                        //logger.debug('deleting user\'s room: ' + users[socket.id].id + ' roomid: ' + keys[i]);
                        delete rooms[keys[i]];
                    } else {
                        updateUserListInRoom(keys[i]);
                    }
                }
            }


            socket.broadcast.emit('userLeft', users[socket.id]);
            delete users[socket.id];

            sendAvailableUsers();
            sendAvailableRooms();
        });


        function updateUserListInRoom(roomId) {
            var socketId;

            if (rooms.hasOwnProperty(roomId)) {
                rooms[roomId].users = [];

                if (io.nsps['/'].adapter.rooms.hasOwnProperty(roomId)) {
                    for (socketId in io.nsps['/'].adapter.rooms[roomId]) {
                        //logger.debug(roomId);
                        if (io.nsps['/'].adapter.rooms[roomId].hasOwnProperty(socketId)) {
                            //logger.debug(users[socketId]);
                            if (users.hasOwnProperty(socketId)) {
                                rooms[roomId].users.push(users[socketId]);
                            }
                        }
                    }
                }
            }
        }

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
                    updateUserListInRoom(key);
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