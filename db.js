var mysql = require('mysql');
var config = require('./config/global');

var knex = require('knex')({
    client: 'mysql',
    connection: config.dbConnection
});

//var connection = mysql.createConnection(config.dbConnection);

//connection.connect(function(err) {
//    if (err) {
//        console.log('Db connection error', err.stack);
//        return;
//    }
//    console.log('Connection to db established as id: '+ connection.threadId);
//});

module.exports = {
    knex: knex
};