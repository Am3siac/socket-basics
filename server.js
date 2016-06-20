var PORT = process.env.PORT || 3000;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');

app.use(express.static(__dirname + '/public'));

var clientInfo = {};

// Sends current users to provided socket
function sendCurrentUsers (socket) {
	var info = clientInfo[socket.id];
	var users =  [];

	if (typeof info === 'undefined') {
		return;
	}

	Object.keys(clientInfo).forEach(function (socketId) {
		var userInfo = clientInfo[socketId];
		
		if (info.room === userInfo.room) {
			users.push(userInfo.name);
		}
	});

	socket.emit('message', {
		name: 'System',
		text: 'Current users: ' + users.join(', '),
		timestamp: moment().valueOf()
	});
}

// Sends private message to a user
function sendPrivateMessage(message) {

	var command = message.text.slice(0,8);
	var secondPart = message.text.slice(9);
	var firstSpaceIndex = secondPart.indexOf(' ');
	var userName = secondPart.slice(0, firstSpaceIndex );
	var privateMessage = secondPart.slice(firstSpaceIndex + 1);

	var foundSocketId;

	Object.keys(clientInfo).forEach(function (socketId) {
		var userInfo = clientInfo[socketId];

		if ( userName  === userInfo.name ) {
			foundSocketId = socketId;
		}

	});

	if (foundSocketId !== 'undefined') {
		io.to(foundSocketId).emit('message', {
			name: message.name + ' sent you a private message',
			text: privateMessage,
			timestamp: moment().valueOf()
		});
	}

	

}

io.on('connection', function(socket) {
	console.log('User connected via socket.io!');

	socket.on('disconnect', function() {
		var userData = clientInfo[socket.id];

		if (typeof userData !== 'undefined') {
			socket.leave(userData.room);
			io.to(userData.room).emit('message', {
				name: 'System',
				text: userData.name + ' has left!',
				timestamp: moment().valueOf()
			});

		}
		delete clientInfo[socket.id];

	});

	socket.on('joinRoom', function(req) {
		clientInfo[socket.id] = req;
		socket.join(req.room);
		socket.broadcast.to(req.room).emit('message', {
			name: 'System',
			text: req.name + ' has joined!',
			timestamp: moment().valueOf()
		});
	});

	socket.on('message', function(message) {
		console.log('Message received: ' + message.text);


		if (message.text === '@currentUsers') {

			sendCurrentUsers(socket);

		} else if (message.text.startsWith('@private ')) {

			sendPrivateMessage(message);

		} else {

			message.timestamp = moment().valueOf();
			// emissione del messaggio verso tutti gli altri client
			// collegati alla socket
			//socket.broadcast.emit('message', message);

			//emissione del messaggio verso tutti i client collegati
			// alla socket, quindi anche verso me stesso
			io.to(clientInfo[socket.id].room).emit('message', message);
		}
	});

	socket.emit('message', {
		name: 'System',
		timestamp: moment().valueOf(),
		text: 'Welcome to the chat application!'
	});
});

http.listen(PORT, function() {
	console.log('Server started!');
})