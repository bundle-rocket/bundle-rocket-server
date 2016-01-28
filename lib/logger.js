/**
 * @file bundle rocket server logger
 * @author leon(ludafa@outlook.com)
 */

const {Logger, transports: {Console}} = require('winston');

const logger = new Logger({

    transports: [
        new Console({
            colorize: true,
            timestamp: true,
            level: process.env.NODE_MODE !== 'production' ? 'verbose' : 'error'
        })
    ]

});

module.exports = logger;
