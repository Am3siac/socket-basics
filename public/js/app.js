var name = getQueryVariable('name') || 'Anonymous';
var room = getQueryVariable('room');
var socket = io();

socket.on('connect', function() {
	console.log('Connected to socket.io server!');

	console.log(name + ' joined room ' + room + ".");
});

socket.on('message', function(message) {
	var momentTimestamp = moment.utc(moment.timestamp);
	var $message = jQuery('.messages');
	console.log('New Message: ');
	console.log(message.text);

	$message.append('<p><strong>' + message.name +  ' ' + momentTimestamp.local().format('h:mm a') + ':</strong></p>');
	$message.append('<p>' + message.text + '</p>');

	
});

// Handles submitting of new message
var $form = jQuery('#message-form');

$form.on('submit', function (event) {
	event.preventDefault();

	var $message = $form.find('input[name=message]')

	socket.emit('message', {
		name: name,
		text: $message.val()
	});

	$message.val('');
	$message.focus();
});
