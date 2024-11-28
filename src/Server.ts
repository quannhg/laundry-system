import fastify, { FastifyInstance } from 'fastify';
import type { FastifyCookieOptions } from '@fastify/cookie';
import { envs, swaggerConfig, swaggerUIConfig } from '@configs';
import { apiPlugin, authPlugin } from '@routes';
import { customErrorHandler } from '@handlers';
import { logger } from '@utils';
import { fastifyMQTT } from './mqtt/index';
import { MQTT_TO_SERVER_TOPIC } from './constants/mqtt';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

export function createServer(config: ServerConfig): FastifyInstance {
    const app = fastify({ logger });

    app.register(import('@fastify/sensible'));
    app.register(import('@fastify/helmet'));
    app.register(import('@fastify/cors'), {
        // origin: envs.CORS_WHITE_LIST
        origin: true,
    });

    app.register(import('@fastify/cookie'), {
        secret: envs.COOKIE_SECRET, // for cookies signature
        hook: 'onRequest',
    } as FastifyCookieOptions);

    // Swagger on production should be turned off
    if (!envs.isProd) {
        app.register(import('@fastify/swagger'), swaggerConfig);
        app.register(import('@fastify/swagger-ui'), swaggerUIConfig);
    }

    app.register(authPlugin, { prefix: '/auth' });
    app.register(apiPlugin, { prefix: '/api' });

    app.setErrorHandler(customErrorHandler);

    // Connect to MQTT broker
    app.register(fastifyMQTT, {
        host: 'mqtt://localhost:1883',
        username: 'python_test',
        password: 'secretpassword',
        topics: [MQTT_TO_SERVER_TOPIC],
    });

    // firebase
    const serviceAccount = JSON.parse(readFileSync(join(__dirname, '../firebaseServiceAccountKey.json'), 'utf-8'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });

    const shutdown = async () => {
        app.mqtt.end();
        await app.close();
    };

    const start = async () => {
        await app.listen({
            host: config.host,
            port: config.port,
        });
        await app.ready();
        if (!envs.isProd) {
            app.swagger({ yaml: true });
            const addr = app.server.address();
            if (!addr) return;
            const swaggerPath = typeof addr === 'string' ? addr : `http://${addr.address}:${addr.port}`;
            app.log.info(`Swagger documentation is on ${swaggerPath}/api-docs`);
        }
    };

    return {
        ...app,
        start,
        shutdown,
    };
}
