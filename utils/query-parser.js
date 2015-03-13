'use strict';
var _ = require('lodash');

var utils = {
    mysql: {
        directionAsc: 'ASC',
        directionDesc: 'DESC',
        getSortQuery: function(params) {
            var orderBy = '';
            params.forEach(function(param) {
                _.forOwn(param, function(value, key) { orderBy += key + ' ' + value + ','; });
            });
            orderBy = _.trimRight(orderBy, ',');
            return orderBy;
        },
        getFieldsQuery: function(fields) {
            return fields;
        }
    }
};

module.exports = function(dbType) {
    if (!dbType) {
        console.log('Query parser error:', 'DB type not passed');
        return;
    }
    if (!_.has(utils, dbType)) {
        console.log('Query parser error:', 'DB type not defined in utils');
        return;
    }
    return {
        /**
         * Parses sort string e.g.
         * ?sort=-id,+name : sort by id descending and by name ascending
         * @param {String} sortQuery
         * @param {Array} columns
         * @returns {Array} [ {id: 'desc'}, {name: 'asc'}, ... ]
         */
        parseSortString: function(sortQuery, columns) {
            var result = [],
                sort = sortQuery,
                direction, tmpSort;
            if (sort) {
                sort = sort.split(',');
                sort.forEach(function (param) {
                    direction = (_.startsWith(param, '-')) ? utils[dbType].directionDesc : utils[dbType].directionAsc;
                    param = _.trimLeft(param, '-+');
                    if (columns.indexOf(param) > -1) {
                        tmpSort = {};
                        tmpSort[param] = direction;
                        result.push(tmpSort);
                    }
                });
            }
            return result;
        },
        /**
         * Returns part of query defining sort type
         */
        getSortQuery: utils[dbType].getSortQuery,
        getSortRegex: function() {
            return /^[\w\-+,]+$/;
        },

        /**
         * Parses fields string e.g.
         * ?fields=id,name,nonExistingField
         * @param {String} fieldsQuery
         * @param {Array} columns
         * @returns {Array} [id, name, ..]
         */
        parseFieldsString: function(fieldsQuery, columns) {
            var result = [],
                fields = fieldsQuery;
            if (fields) {
                fields = fields.split(',');
                fields.forEach(function (field) {
                    if (_.indexOf(columns, field) > -1) {
                        result.push(field);
                    }
                });
            }
            return result;
        },
        /**
         * Returns part of query defining which fields should come from database
         */
        getFieldsQuery: utils[dbType].getFieldsQuery,
        getFieldsRegex: function() {
            return /^[\w,]+$/;
        }
    };
};
