'use strict';
var Boom = require('boom');
var Joi = require('joi');
var _ = require('lodash');
var db = require('./../db');

var Events = {
    getAll: function(req, reply) {
        db.knex.select().from('events')
            .then(function(rows) {
                reply(rows);
            })
            .catch(function(err) {
                console.log('DB error: ' + err.stack);
                reply(Boom.create(503, 'DB error'));
            })
    },
    get: function(req, reply) {
        var id = req.params.id, record;
        db.knex.select().from('events').where({id: id})
            .then(function(rows) {
                if(rows.length === 1) {
                    reply(rows[0]);
                } else {
                    reply(Boom.notFound('Event with id: ' + id + ' not found'));
                }
            })
            .catch(function(err) {
                console.log('DB error: ' + err.stack);
                reply(Boom.create(503, 'DB error'));
            });
    },
    create: function(req, reply) {
        var object = req.payload;
        db.knex.insert(object).into('events')
            .then(function(rows) {
                console.log(rows);
                reply({insertedId: rows[0]}).code(201);
            })
            .catch(function(err) {
                console.log('DB error: ' + err.stack);
                reply(Boom.create(503, 'DB error'));
            });
    }
};

var plugin = {
    register: function(server, options, next) {
        server.route({
            method: 'GET',
            path: '/api/v1/events',
            handler: Events.getAll
        });

        server.route({
            method: 'GET',
            path: '/api/v1/events/{id}',
            handler: Events.get,
            config: {
                validate: {
                    params: {
                        id: Joi.number().integer().min(0)
                    }
                }
            }
        });

        server.route({
            method: 'POST',
            path: '/api/v1/events',
            handler: Events.create,
            config: {
                validate: {
                    payload: {
                        name: Joi.string().min(2),
                        place: Joi.string().min(1)
                    }
                }
            }
        })
    }
};
plugin.register.attributes = {
    name: 'Events'
};

module.exports = plugin;