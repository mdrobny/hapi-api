'use strict';
var _ = require('lodash');

var utils = {
    mysql: {
        directionAsc: 'ASC',
        directionDesc: 'DESC',
        getSort: function(params) {
            var orderBy = '';
            params.forEach(function(param) {
                _.forOwn(param, function(value, key) { orderBy += key + ' ' + value +','});
            });
            orderBy = _.trimRight(orderBy, ',');
            return orderBy;
        },
        getFields: function(fields) {
            return fields;
        }
    }
};

module.exports = function(dbType) {
    return {
        sortParse: function(sortQuery, columns) {
            var result = [],
                sort = sortQuery,
                direction, tmpSort;
            if (sort) {
                sort = sort.split(',');
                sort.forEach(function (param) {
                    direction = (_.startsWith(param, '-')) ? utils[dbType].directionDesc : utils[dbType].directionAsc;
                    param = _.trimLeft(param, '-+');
                    if (_.indexOf(columns, param) > -1) {
                        tmpSort = {};
                        tmpSort[param] = direction;
                        result.push(tmpSort);
                    }
                });
            }
            return result;
        },
        getSort: utils[dbType].getSort,

        fieldsParse: function(fieldsQuery, columns) {
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
        getFields: utils[dbType].getFields
    }
};

