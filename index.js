'use strict';
var Hapi = require('hapi');
var Good = require('good');
var config = require('./config/global');

var server = new Hapi.Server();
server.connection({
	host: 'localhost',
	port: 8080
});

/** Register all routes **/
server.register({
    register: require('./routes/events')
}, function (err) {
    if (err) {
        throw err;
    }
});

server.register({
    register: Good,
    options: {
        reporters: [{
            reporter: require('good-console'),
            args:[{ log: '*', response: '*' }]
        }]
    }
}, function (err) {
    if (err) {
        throw err;
    }

    server.start(function () {
        server.log('info', 'Server running at: ' + server.info.uri);
    });
});

module.exports = server;