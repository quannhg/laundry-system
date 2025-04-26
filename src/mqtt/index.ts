import { FastifyInstance } from 'fastify';
import { mqttClient } from './client';

export function fastifyMQTT(fastify: FastifyInstance, options: MqttConfig, next: (err?: Error) => void) {
    const client = mqttClient;

    if (fastify.mqtt) {
        next(new Error('fastify-mqtt has already registered'));
        return;
    }

    fastify.decorate('mqtt', client);

    next();
}
