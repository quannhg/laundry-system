import { MqttClient } from 'mqtt';
import { MESSAGE_TYPE, MQTT_TO_SERVER_TOPIC } from '@constants';
import { logger } from '@utils';
import { addMachine, removeMachine, updateWashingStatus, updatePowerConsumption } from './washingMachine.mqtt';

interface MqttMessage {
    type: MESSAGE_TYPE;
    payload: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function setupMessageHandler(client: MqttClient): void {
    client.on('connect', () => {
        logger.info('Connected to MQTT broker');
        client.subscribe(MQTT_TO_SERVER_TOPIC, (err) => {
            if (err) {
                logger.error('Error subscribing to topic:', err);
            }
        });
    });

    client.on('message', async (topic, message) => {
        try {
            if (topic !== MQTT_TO_SERVER_TOPIC) {
                return;
            }

            const data: MqttMessage = JSON.parse(message.toString());

            switch (data.type) {
                case MESSAGE_TYPE.ADD_MACHINE:
                    await addMachine(client, data.payload);
                    break;

                case MESSAGE_TYPE.REMOVE_MACHINE:
                    await removeMachine(client, data.payload);
                    break;

                case MESSAGE_TYPE.UPDATE_MACHINE_STATUS:
                    await updateWashingStatus(client, data.payload);
                    break;

                case MESSAGE_TYPE.POWER_CONSUMPTION_UPDATE:
                    await updatePowerConsumption(client, data.payload);
                    break;

                default:
                    logger.warn(`Unknown message type: ${data.type}`);
            }
        } catch (error) {
            logger.error('Error processing MQTT message:', error);
        }
    });

    client.on('error', (err) => {
        logger.error('MQTT client error:', err);
    });
}
