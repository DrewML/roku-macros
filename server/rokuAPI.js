const got = require('got');
const { URL } = require('url');
const xml2js = require('xml2js');
const { promisify: pify } = require('util');

const rokuAPI = {
    async deviceInfo(location) {
        const { body } = await got(new URL('query/device-info', location));
        return (await pify(xml2js.parseString)(body))['device-info'];
    },

    async search(location, key) {
        const deviceInfo = await rokuAPI.deviceInfo(location);
        await got.post(new URL(`search/browse?keyword=${term}`, location));
        // Roku doesn't provide a body back for `search`
    }
};

module.exports = rokuAPI;
