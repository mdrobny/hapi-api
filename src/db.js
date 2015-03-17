var mysql = require('mysql');
var config = require('./config/global');

var knex = require('knex')({
    client: 'mysql',
    connection: config.dbConnection
});

var bookshelf = require('bookshelf')(knex);

module.exports = {
    knex: knex,
    bs: bookshelf
};
