import { prisma } from '@repositories';
import { LaundryStatus, OrderStatus } from '@prisma/client';
import { MqttClient } from 'mqtt';
import { logger } from '@utils';
import { MESSAGE_TYPE, MQTT_TO_HARDWARE_TOPIC } from '@constants';
import admin from 'firebase-admin';
import { publishMqttMessage } from '@utils';

export async function addMachine(client: MqttClient, machine: MqttMessagePayload): Promise<void> {
    const machineData = machine as { id: string; machineNo: number };
    try {
        await prisma.washingMachine.create({
            data: {
                id: machineData.id,
                status: LaundryStatus.IDLE,
                machineNo: machineData.machineNo,
            },
        });

        client.publish(
            MQTT_TO_HARDWARE_TOPIC,
            JSON.stringify({
                type: MESSAGE_TYPE.ADD_MACHINE,
                payload: { status: 'success', id: machineData.id },
            }),
        );
    } catch (error) {
        logger.error('Error adding machine:', error.message);
        client.publish(
            MQTT_TO_HARDWARE_TOPIC,
            JSON.stringify({
                type: MESSAGE_TYPE.ADD_MACHINE,
                payload: { status: 'error', id: machineData.id, message: error.message },
            }),
        );
    }
}

export async function removeMachine(client: MqttClient, machine: MqttMessagePayload): Promise<void> {
    const machineData = machine as { id: string };
    try {
        await prisma.washingMachine.delete({
            where: {
                id: machineData.id,
            },
        });

        client.publish(
            MQTT_TO_HARDWARE_TOPIC,
            JSON.stringify({
                type: MESSAGE_TYPE.REMOVE_MACHINE,
                payload: { status: 'success', id: machineData.id },
            }),
        );
    } catch (error) {
        logger.error('Error removing machine:', error);
        client.publish(
            MQTT_TO_HARDWARE_TOPIC,
            JSON.stringify({
                type: MESSAGE_TYPE.REMOVE_MACHINE,
                payload: { status: 'error', id: machineData.id, message: error.message },
            }),
        );
    }
}

export async function updateWashingStatus(client: MqttClient, machine: MqttMessagePayload): Promise<void> {
    const machineData = machine as { id: string; status: LaundryStatus };
    try {
        // Update washing machine status in the database
        await prisma.washingMachine.update({
            where: {
                id: machineData.id,
            },
            data: {
                status: machineData.status,
            },
        });

        if (machineData.status === LaundryStatus.IDLE) {
            // Handle order completion
            const completedOrder = await handleOrderCompletion(machineData.id);
            logger.debug('Completed orders:', completedOrder);
            if (completedOrder) {
                // Send completion notification
                await sendCompletionNotification(completedOrder.userId, completedOrder.id);
            }
        }

        // Publish status update to the hardware via MQTT
        publishMqttMessage(client, {
            type: MESSAGE_TYPE.UPDATE_MACHINE_STATUS,
            payload: { status: 'success', id: machineData.id },
        });
    } catch (error) {
        logger.error('Error updating washing status:', error);
        publishMqttMessage(client, {
            type: MESSAGE_TYPE.UPDATE_MACHINE_STATUS,
            payload: { status: 'error', id: machineData.id, message: error.message },
        });
    }
}

async function handleOrderCompletion(machineId: string) {
    try {
        const orders = await prisma.order.findMany({
            where: {
                machineId: machineId,
                status: OrderStatus.WASHING,
            },
        });

        if (orders.length !== 1) {
            throw new Error(`Unexpected number of orders found: ${orders.length}`);
        }

        const orderToUpdate = orders[0];
        const updatedOrder = await prisma.order.update({
            where: {
                id: orderToUpdate.id,
            },
            data: {
                status: OrderStatus.FINISHED,
            },
        });

        return updatedOrder;
    } catch (error) {
        logger.error('Error updating order status:', error);
        throw new Error('Order update failed');
    }
}

async function sendCompletionNotification(userId: string, orderId: string) {
    try {
        const tokens = await prisma.fCMToken.findMany({ where: { userId: userId } });

        if (tokens.length === 0) {
            logger.warn(`No FCM tokens found for user ${userId}`);
            return;
        }

        const message: admin.messaging.MulticastMessage = {
            notification: {
                title: `Order ${orderId} finished`,
                body: 'Your laundry is done.',
            },
            tokens: tokens.map((t) => t.token),
        };

        await admin.messaging().sendEachForMulticast(message);
    } catch (error) {
        logger.error('Error sending notification:', error);
    }
}
