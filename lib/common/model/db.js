/**
 * @file database connection
 * @author leon(ludafa@outlook.com)
 */

const path = require('path');
const conf = require('../../../conf').database;
const Sequelize = require('sequelize');

const {dialect} = conf;
const {database, username, password, ...rest} = conf[dialect];
const storage = dialect === 'sqlite' ? conf[dialect].storage : null;

console.log(`current database ${dialect} ${database}`);

let connection = new Sequelize(
    database,
    username,
    password,
    {
        dialect,
        storage: path.join(__dirname, '../../', storage),
        ...rest
    }
);

module.exports = connection;
