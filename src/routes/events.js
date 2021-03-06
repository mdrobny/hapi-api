'use strict';
var Boom = require('boom');
var Joi = require('joi');
var _ = require('lodash');
var db = require('./../db');
var queryParser = require('./../utils/query-parser')('mysql');

var Events = (function() {
    var table = 'events',
        columns = ['id', 'name', 'place'];

    var Event = db.bs.Model.extend({
        tableName: 'events',
        defaults: {
            id: undefined,
            name: '',
            placeId: undefined
        }
    });
    var Events = db.bs.Collection.extend({
        model: Event
    });
    return {
        getAll: function(req, reply) {
            var sort = req.query.sort,
                limit = req.query.limit,
                offset = req.query.offset,
                fields = req.query.fields,
                Collection = new Events();

            sort = queryParser.parseSortString(sort, columns);
            fields = queryParser.parseFieldsString(fields, columns);

            sort = queryParser.getSortQuery(sort);
            fields = queryParser.getFieldsQuery(fields);
            var options = {
                columns: fields,
                debug: true
            };
            Collection.query(function(qb) {
                qb.limit(limit)
                    .offset(offset)
                    .orderByRaw(sort);
            })
                .fetch(options)
                .then(function(collection) {
                    reply(collection);
                })
                .catch(function(err) {
                    console.log('DB error: ' + err.stack);
                    reply(Boom.create(503, 'DB error'));
                });
        },
        get: function(req, reply) {
            var id = req.params.id,
                Model = new Event({id: id}),
                options = {
                    columns: ['id', 'name'],
                    debug: true
                };
            Model.fetch(options)
                .then(function(model) {
                    if (model) {
                        req.log.info(model);
                        reply(model);
                    } else {
                        reply(Boom.notFound('Event with id: ' + id + ' not found'));
                    }
                })
                .catch(function(err) {
                    req.log.info('DB error: ' + err.stack);
                    reply(Boom.create(503, 'DB error'));
                });
        },
        create: function(req, reply) {
            var object = req.payload,
                model = new Event(object);
            model.save()
                .then(function(model) {
                    req.log.info(model);
                    reply(model).code(201);
                })
                .catch(function(err) {
                    req.log.info(err);
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
            path: '/api/v1/events',
            handler: Events.getAll,
            config: {
                validate: {
                    query: {
                        sort: Joi.string().min(2).regex(queryParser.getSortRegex()),
                        offset: Joi.number().integer().min(0).default(0),
                        limit: Joi.number().integer().min(1).default(9),
                        fields: Joi.string().regex(queryParser.getFieldsRegex())
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
                        placeId: Joi.number().integer().min(1).required()
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
