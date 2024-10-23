import { prisma } from '@repositories';
import { LaundryStatus } from '@prisma/client';
import { MqttClient } from 'mqtt';
import { logger } from '@utils';
import { MESSAGE_TYPE, MQTT_TO_HARDWARE_TOPIC } from '@constants';

export async function addMachine(client: MqttClient, machine: MqttMessagePayload): Promise<void> {
    const machineData = machine as { id: string };
    try {
        await prisma.washingMachine.create({
            data: {
                id: machineData.id,
                status: LaundryStatus.IDLE
            }
        });

        client.publish(
            MQTT_TO_HARDWARE_TOPIC,
            JSON.stringify({
                type: MESSAGE_TYPE.RES_ADD_MACHINE,
                payload: { status: 'success', id: machineData.id }
            })
        );
    } catch (error) {
        logger.error('Error adding machine:', error.message);
        client.publish(
            MQTT_TO_HARDWARE_TOPIC,
            JSON.stringify({
                type: MESSAGE_TYPE.RES_ADD_MACHINE,
                payload: { status: 'error', id: machineData.id, message: error.message }
            })
        );
    }
}

export async function removeMachine(client: MqttClient, machine: MqttMessagePayload): Promise<void> {
    const machineData = machine as { id: string };
    try {
        await prisma.washingMachine.delete({
            where: {
                id: machineData.id
            }
        });

        client.publish(
            MQTT_TO_HARDWARE_TOPIC,
            JSON.stringify({
                type: MESSAGE_TYPE.RES_REMOVE_MACHINE,
                payload: { status: 'success', id: machineData.id }
            })
        );
    } catch (error) {
        logger.error('Error removing machine:', error);
        client.publish(
            MQTT_TO_HARDWARE_TOPIC,
            JSON.stringify({
                type: MESSAGE_TYPE.RES_REMOVE_MACHINE,
                payload: { status: 'error', id: machineData.id, message: error.message }
            })
        );
    }
}
