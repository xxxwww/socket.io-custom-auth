var auth, authenticate, io;

io = require('socket.io')();

authenticate = require('../');


auth = function(socket, data, done) {
	if (data.token === 'sometoken!') {
		var user = {
			id: 1
		}
		return done(null, user);
	} else {
		return done(new Error('unauthorized'));
	}
};

authenticate(io, auth, function(socket) {
	socket.on('event', function(data) {
		socket.emit('someevent', data);
	});
});

module.exports = io;
