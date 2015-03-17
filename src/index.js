'use strict';
var Hapi = require('hapi');
var Bunyan = require('bunyan');
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
    register: require('hapi-bunyan'),
    options: {
        logger: Bunyan.createLogger({name: 'server', level: 'info'})
    }
}, function(err) {
    if (err) {
        throw err;
    }

    server.start(function () {
        server.log('info', 'Server running at: ' + server.info.uri);
    });
});

module.exports = server;
