module.exports = function(io, auth, options, callback) {
	var timeout;
	
	if (typeof options === 'function') {
		callback = options;
		options = {};
	}
	options.timeout || (options.timeout = 1000);
	
	timeout = function(time, fn) {
		return setTimeout(fn, time);
	};

	return io.on('connection', function(socket) {
		var disconnect = function(error) {
			if (error == null) {
				error = 'unauthorized';
			}
			if (error instanceof Error) {
				error = error.message;
			}
			socket.emit('unauthenticated', error);
			return socket.disconnect();
		};

		timeout(options.timeout, function() {
			if (!socket.authenticated) {
				return disconnect('authentication timeout');
			}
		});

		socket.authenticated = false;
		return socket.on('authenticate', function(data) {
			return auth(socket, data, function(error, data) {
				if (data == null) data = {};
				if (error != null) {
					return disconnect(error);
				} else {
					socket.authenticated = true;
					socket.user = data;
					socket.emit('authenticated', data);
					return callback(socket);
				}
			});
		});
	});
};