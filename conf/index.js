/**
 * @file configuration
 * @author leon(ludafa@outlook.com)
 */


const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const confName = process.env.NODE_ENV || 'develop';

const conf = yaml.safeLoad(
    fs.readFileSync(
        path.join(__dirname, `./${confName}.yml`),
        'utf8'
    )
);


module.exports = conf;
