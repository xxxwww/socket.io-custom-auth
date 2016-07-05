var port = 5000;
var url = "http://localhost:" + port;

server.listen(port);

var validCredentials = {
	token: "sometoken!"
};

var invalidCredentials = {
	token: "bad token"
};

describe('socket.io-custom-auth', () => {
	var socket = null;

	beforeEach(() => {
		socket = io(url, {
			'force new connection': true
		});
	});
	
	afterEach(() => {
		socket.disconnect();
	});
	
	context('before authentication', () => {
		it('marks socket as unauthenticated', () => {
			expect(socket.authenticated).to.not.be.ok;
		});
		it('dose not sent messages to sockets', (done) => {
			socket.on('pong', () => {
				return done(new Error('got message while unauthorized'));
			});
			timeout(500, done);
		});
		it('disconnects unauthenticated sockets after timeout window', (done) => {
			socket.on('disconnect', () => {
				return done();
			});
		});
	});
	
	context('on authentication', () => {
		context('with valid credentials', () => {
			it('authenticates and emits authenticated signal with user data', (done) => {
				socket.on('authenticated', (user) => {
					if (user.id == 1) return done();
				});
				socket.emit('authenticate', validCredentials);
			});
		});
		context('with invalid credentials', () => {
			it('disconnects the socket', (done) => {
				socket.on('disconnect', () => {
					return done();
				});
				socket.emit('authenticate', invalidCredentials);
			});
			it('emits unauthenticated signal with error message', (done) => {
				socket.on('unauthenticated', (data) => {
					expect(data).to.not.be.empty;
					return done();
				});
				socket.emit('authenticate', invalidCredentials);
			});
		});
	});
	
	context('after authentication', () => {
		it('handles all signals normally', (done) => {
			socket.on('authenticated', (user) => {
				socket.on('someevent', (data) => {
					if (data === 'message') {
						return done();
					}
				});
				socket.emit('event', 'message');
			});
			socket.emit('authenticate', validCredentials);
		});
	});
});