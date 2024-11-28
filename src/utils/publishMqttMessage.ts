import { IClientPublishOptions, MqttClient } from 'mqtt';
import { MQTT_TO_HARDWARE_TOPIC } from '@constants';
import { logger } from './logger';

function publishMqttMessage(client: MqttClient, message: MqttMessage, options: IClientPublishOptions = {}) {
    client.publish(MQTT_TO_HARDWARE_TOPIC, JSON.stringify(message), options, (err) => {
        if (err) {
            logger.error('Error publishing MQTT message:', err);
        }
    });
}

export { publishMqttMessage };
