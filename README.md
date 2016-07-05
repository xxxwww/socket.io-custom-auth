# socket.io-custom-auth

[![Build Status](https://travis-ci.org/xxxwww/socket.io-custom-auth.svg?branch=master)](https://travis-ci.org/xxxwww/socket.io-custom-auth)

It provides a hook to authenticate [socket.io](https://github.com/socketio/socket.io)
without using query-strings to send credentials, which is not a good security practice.

It works by preventing access to socket object before authentication, which is
done by given auth function and submitted credentials on `authenticate` event.

## Installation

```bash
npm install socket.io-custom-auth
```

## Usage

Just pass socket.io server and `auth` function to `socket.io-custom-auth` and add other
events on callback:
```javascript
var io = require('socket.io')(4000)

// setup and authentication method
auth = function(data, done) {
  // check for valid credential data
  if (data.token == 'test token') {
    var userdata = {
      id: 1
    };
    
    socket.user = userdata;
    done(null, userdata);
  } else {
    done(new Error('bad token')) // or any error message
  }
};

require('socket.io-custom-auth')(io, auth, function(socket){
  // you can get access to user data via `socket.user`
  
  // use socket as before to implement other signals
  socket.on('event', function(data){
    socket.emit('someevent', data);
  });
});
```

you can set authentication window with timeout option (default is 1s (1000ms)):

```javascript
require('socket.io-custom-auth')(io, auth, {timeout: 3000}, function(socket){
  // rest of code ...
});
```

clients just need to authenticate after connection:
```javascript
var socket = require('socket.io-client')('http://localhost:4000');

socket.on('connect', function(){
  socket.emit('authenticate', {token: 'test token'});
  socket.on('authenticated', function(user){
    // on client you can get access to user data via `user` object

    // now it is an authenticated socket and works as before
    socket.on('someevent', function(data){
      console.log('Data from socket.io server:', data)
    });
    socket.emit('event', data);
  });
  socket.on('unauthenticated', function(err){
    // unauthenticated err message handling
  });
});
```

## Contribute

You are always welcome to open an issue or provide a pull-request!

Also checkout the tests:

```
$ npm test

  socket.io-custom-auth
    before authentication
      ✓ marks socket as unauthenticated
      ✓ dose not sent messages to sockets
      ✓ disconnects unauthenticated sockets after timeout window
    on authentication
      with valid credentials
        ✓ authenticates and emits authenticated signal with user data
      with invalid credentials
        ✓ disconnects the socket
        ✓ emits unauthenticated signal with error message
    after authentication
      ✓ handles all signals normally
```

