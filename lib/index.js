/**
* Copyright 2014 Baidu Inc. All rights reserved.
*
* @file bundle-rocket-server 主入口
* @author leon <ludafa@outlook.com>
*/

require('babel-core/register');

require('./server.js');

process.on('uncaughtException', function (error) {
    console.error(error.stack);
});
