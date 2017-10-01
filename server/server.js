const path = require('path');
const { Server } = require('hapi');
const inert = require('inert');
const RokuExternalControl = require('./RokuExternalControl');
const rokuAPI = require('./rokuAPI');
const MacroDB = require('./MacroDB');

exports.start = async () => {
    const server = new Server({
        debug: { request: ['error'] }
    });
    server.connection({
        host: process.env.HOST || 'localhost',
        port: process.env.PORT || '3000'
    });
    await server.register(inert);

    const macroDB = new MacroDB({
        dbPath: process.env.DB_PATH || path.join(__dirname, 'macros.json')
    });
    const devices = [];
    const roku = new RokuExternalControl();
    roku.on(RokuExternalControl.DISCOVERED, device => devices.push(device));

    server.route({
        method: 'GET',
        path: '/',
        handler: {
            file: 'client/dist/index.html'
        }
    });

    server.route({
        method: 'GET',
        path: '/devices',
        handler: async (req, reply) => {
            const devicesInfo = await Promise.all(
                devices.map(device => rokuAPI.deviceInfo(device.location))
            );
            reply(devicesInfo);
        }
    });

    server.route({
        method: 'POST',
        path: '/devices/refresh',
        handler: (req, reply) => {
            devices.length = 0;
            roku.discover();
            reply();
        }
    });

    server.route({
        method: 'GET',
        path: '/macros',
        handler: (req, reply) => {
            reply(macroDB.db);
        }
    });

    server.route({
        method: 'POST',
        path: '/macros/add',
        handler: (req, reply) => {
            throw new Error('Not implemented');
        }
    });

    server.route({
        method: 'GET',
        path: '/assets/{param*}',
        handler: {
            directory: {
                path: 'client/dist'
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/{p*}',
        handler: {
            file: 'client/dist/index.html'
        }
    });

    await server.start();
    console.log(`"Roku Macros" server running at ${server.info.uri}`);
};
