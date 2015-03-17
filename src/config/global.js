var environmentConfig = require('./development');
var _ = require('lodash');

var config = {
    dummy: undefined
};

/** Local environment config overrides global **/
_.assign(config, environmentConfig);

module.exports = config;