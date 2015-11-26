/**
 * @file database connection
 * @author leon(ludafa@outlook.com)
 */

const conf = require('../../../conf').database;
const Sequelize = require('sequelize');

const {dialect} = conf;
const {database, username, password, ...rest} = conf[dialect];

let connection = new Sequelize(
    database,
    username,
    password,
    {
        dialect,
        ...rest
    }
);

module.exports = connection;
