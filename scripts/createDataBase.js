/**
 * @file create database for bundle-rocket
 * @author leon(ludafa@outlook.com)
 */

require('babel-core/register');

debugger;

require('../lib/common/model/User.js');
require('../lib/common/model/App.js');
require('../lib/common/model/Bundle.js');

const sequelize = require('../lib/common/model/db.js');

sequelize
    .sync({
        logging: console.log
    })
    .then(() => {
        console.log(arguments)
    });
