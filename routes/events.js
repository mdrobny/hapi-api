'use strict';
var Boom = require('boom');
var Joi = require('joi');
var _ = require('lodash');
var db = require('./../db');

var Events = (function() {
    var table = 'events';
    return {
        getAll: function(req, reply) {
            var limit = req.params.limit,
                offset = req.params.offset;
            console.log('limit', limit);
            console.log('offset', offset);
            db.knex.select().from(table)
                .then(function(rows) {
                    reply(rows);
                })
                .catch(function(err) {
                    console.log('DB error: ' + err.stack);
                    reply(Boom.create(503, 'DB error'));
                });
        },
        get: function(req, reply) {
            var id = req.params.id;
            db.knex.select().from(table).where({id: id})
                .then(function(rows) {
                    if (rows.length === 1) {
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
            db.knex.insert(object).into(table)
                .then(function(rows) {
                    reply({insertedId: rows[0]}).code(201);
                })
                .catch(function(err) {
                    console.log('DB error: ' + err.stack);
                    reply(Boom.create(503, 'DB error'));
                });
        },
        remove: function(req, reply) {
            var id = req.params.id;
            db.knex.del().from(table).where({id: id})
                .then(function(affectedRows) {
                    if (affectedRows === 0) {
                        reply(Boom.notFound('Event with id: ' + id + ' not found'));
                        return;
                    }
                    reply({deletedRows: affectedRows}).code(200);
                })
                .catch(function(err) {
                    console.log('DB error: ' + err.stack);
                    reply(Boom.create(503, 'DB error'));
                });
        },
        update: function(req, reply) {
            var id = req.params.id,
                object = req.payload;
            if (_.isEmpty(object)) {
                reply(Boom.notAcceptable());
                return;
            }
            db.knex(table).update(object).where({id: id})
                .then(function(affectedRows) {
                    if (affectedRows === 0) {
                        reply(Boom.notFound('Event with id: ' + id + ' not found'));
                        return;
                    }
                    reply({updatedRows: affectedRows}).code(200);
                })
                .catch(function(err) {
                    console.log('DB error: ' + err.stack);
                    reply(Boom.create(503, 'DB error'));
                });
        }
    };
})();

var plugin = {
    register: function(server, options, next) {
        server.route({
            method: 'GET',
            path: '/api/v1/events/',
            handler: Events.getAll,
            config: {
                validate: {
                    params: {
                        limit: Joi.number().integer().min(1).default(9),
                        offset: Joi.number().integer().min(0).default(0)
                    }
                }
            }
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
                        name: Joi.string().min(2).required(),
                        place: Joi.string().min(1).required()
                    }
                }
            }
        });
        server.route({
            method: 'DELETE',
            path: '/api/v1/events/{id}',
            handler: Events.remove,
            config: {
                validate: {
                    params: {
                        id: Joi.number().integer().min(0)
                    }
                }
            }
        });
        server.route({
            method: 'PUT',
            path: '/api/v1/events/{id}',
            handler: Events.update,
            config: {
                validate: {
                    params: {
                        id: Joi.number().integer().min(0)
                    },
                    payload: {
                        name: Joi.string().min(2),
                        place: Joi.string().min(1)
                    }
                }
            }
        });

        next();
    }
};
plugin.register.attributes = {
    name: 'Events'
};

module.exports = plugin;
