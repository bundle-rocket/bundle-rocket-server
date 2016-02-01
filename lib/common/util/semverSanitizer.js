/**
 * @file semver sanitizer
 * @author leon(ludafa@outlook.com)
 */

const semver = require('semver');

module.exports = function (version, defaultMajor, defaultMinor, defaultPatch) {

    version += '';

    if (semver.valid(version)) {
        return version;
    }

    if (!version) {
        return '';
    }

    defaultMajor = defaultMajor || '1';
    defaultMinor = defaultMinor || '0';
    defaultPatch = defaultPatch || '0';

    const metaIndex = version.indexOf('+');
    let meta = metaIndex >= 0 ? version.slice(metaIndex + 1) : '';
    meta = /^-[0-9A-Za-z-]+$/.test(meta) ? meta : '';

    const preReleaseIndex = version.indexOf('-');
    let preVersion = preReleaseIndex >= 0 ? version.slice(preReleaseIndex + 1)  : '';
    preVersion = /^-[0-9A-Za-z-]+$/.test(preVersion) ? preVersion : '';

    const main = preReleaseIndex >= 0 ? version.slice(0, preReleaseIndex) : version;

    let match = /^(\d+)?(\.\d+)?(\.\d+)?$/.exec(main);

    if (!match) {
        return null;
    }

    const x = match[1] || defaultMajor;
    const y = match[2] ? match[2].slice(1) : defaultMinor;
    const z = match[3] ? match[3].slice(1) : defaultPatch;

    return `${x}.${y}.${z}${preVersion}${meta}`;

};
