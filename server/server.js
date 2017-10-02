const joi = require('joi');
const path = require('path');
const boom = require('boom');
const inert = require('inert');
const assert = require('assert');
const { green } = require('chalk');
const { Server } = require('hapi');
const rokuAPI = require('./rokuAPI');
const MacroDB = require('./MacroDB');
const runMacro = require('./runMacro');
const RokuExternalControl = require('./RokuExternalControl');

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
        dbPath: process.env.DB_PATH || path.join(__dirname, '../macros.json')
    });
    const deviceLocations = [];
    const roku = new RokuExternalControl();
    roku.on(RokuExternalControl.DISCOVERED, location =>
        deviceLocations.push(location)
    );

    server.route({
        method: 'GET',
        path: '/',
        handler: {
            file: 'client/index.html'
        }
    });

    server.route({
        method: 'GET',
        path: '/devices',
        handler: async (req, reply) => {
            const devicesInfo = await Promise.all(
                deviceLocations.map(rokuAPI.deviceInfo)
            );
            reply(devicesInfo);
        }
    });

    server.route({
        method: 'POST',
        path: '/devices/refresh',
        handler: (req, reply) => {
            deviceLocations.length = 0;
            roku.discover();
            reply();
        }
    });

    server.route({
        method: 'GET',
        path: '/macros',
        handler: (req, reply) => {
            reply(macroDB.db.savedMacros);
        }
    });

    server.route({
        method: 'POST',
        path: '/macros/run',
        handler: async ({ payload }, reply) => {
            const { operations } = macroDB.get(payload.macroName);
            await runMacro(payload.location, operations);
        },
        config: {
            validate: {
                payload: joi
                    .object()
                    .keys({
                        macroName: joi.string().required(),
                        location: joi.string().required()
                    })
                    .required()
            }
        }
    });

    server.route({
        method: 'POST',
        path: '/macros/add',
        handler: async ({ payload }, reply) => {
            if (macroDB.exists(payload.name)) {
                return reply(
                    boom.badRequest(`"${payload.name}" already exists`)
                );
            }

            await macroDB.add(payload.name, {
                operations: payload.operations
            });
        },
        config: {
            validate: {
                payload: joi
                    .object()
                    .keys({
                        name: joi.string().required(),
                        operations: joi
                            .array()
                            .min(1)
                            .items(
                                joi
                                    .object()
                                    .keys({
                                        type: joi.string().required(),
                                        value: joi.string().required()
                                    })
                                    .required()
                            )
                            .required()
                    })
                    .required()
            }
        }
    });

    // Static assets
    server.route({
        method: 'GET',
        path: '/assets/{param*}',
        handler: {
            directory: {
                path: 'client/dist'
            }
        }
    });

    // Catch-all
    server.route({
        method: 'GET',
        path: '/{p*}',
        handler: {
            file: 'client/index.html'
        }
    });

    await server.start();
    console.log(`"Roku Macros" server running at ${green(server.info.uri)}`);
};
