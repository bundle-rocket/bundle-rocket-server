require('babel-core/register');

const s = require('../lib/common/util/semverSanitizer.js');

console.log(s('1.0'));
