var PORT = process.env.PORT || 3000;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket) {
	console.log('User connected via socket.io!');

	socket.on('message', function(message) {
		console.log('Message received: ' + message.text);
		message.timestamp = moment().valueOf();

		// emissione del messaggio verso tutti gli altri client
		// collegati alla socket
		//socket.broadcast.emit('message', message);

		//emissione del messaggio verso tutti i client collegati
		// alla socket, quindi anche verso me stesso
		io.emit('message', message);
	});

	socket.emit('message', {
		name: 'System',
		timestamp : moment().valueOf(),
		text: 'Welcome to the chat application!'
	});
});

http.listen(PORT, function() {
	console.log('Server started!');
})