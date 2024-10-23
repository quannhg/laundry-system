import mqtt, { MqttClient } from 'mqtt';
import { logger } from '@utils';
import { addMachine, removeMachine } from './washingMachine.mqtt';
import { FastifyInstance } from 'fastify';
import { MESSAGE_TYPE } from '@constants';

function subscribeTopics(client: MqttClient, topics: string[]) {
    topics.forEach((topic) => {
        client.subscribe(topic, (err) => {
            if (err) {
                logger.error(`Failed to subscribe to topic ${topic}: `, err);
                return;
            }
            logger.info(`Subscribed to topic ${topic}`);
        });
    });

    client.on('message', (topic, message) => {
        logger.debug(`Received message on topic ${topic}: ${message.toString()}`);

        const { type, payload } = JSON.parse(message.toString()) as MqttMessage;

        switch (type) {
            case MESSAGE_TYPE.REQ_ADD_MACHINE:
                addMachine(client, payload);
                break;
            case MESSAGE_TYPE.REQ_REMOVE_MACHINE:
                removeMachine(client, payload);
                break;
            default:
                logger.warn(`Unknown message type: ${type}`);
        }
    });
}

export function fastifyMQTT(fastify: FastifyInstance, options: MqttConfig, next: (err?: Error) => void) {
    const { host, topics, ...mqttOptions } = options;
    const client = mqtt.connect(host, mqttOptions);

    client.on('connect', () => {
        subscribeTopics(client, topics);
    });

    if (fastify.mqtt) {
        next(new Error('fastify-mqtt has already registered'));
        return;
    }

    fastify.decorate('mqtt', client);

    next();
}
