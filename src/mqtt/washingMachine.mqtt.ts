import { prisma } from '@repositories';
import { LaundryStatus, OrderStatus } from '@prisma/client';
import { MqttClient } from 'mqtt';
import { logger, pushNotification } from '@utils';
import { MESSAGE_TYPE, MQTT_TO_HARDWARE_TOPIC } from '@constants';
import { publishMqttMessage } from '@utils';

export async function addMachine(client: MqttClient, machine: MqttMessagePayload): Promise<void> {
    const machineData = machine as { id: string };
    try {
        const maxMachineNo = await prisma.washingMachine.aggregate({
            _max: {
                machineNo: true,
            },
        });

        const newMachineNo = (maxMachineNo._max.machineNo || 0) + 1;

        await prisma.washingMachine.create({
            data: {
                id: machineData.id,
                status: LaundryStatus.IDLE,
                machineNo: newMachineNo,
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
        logger.error(`Error adding machine: ${error.message}`);
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
        const currentMachineStatus = await prisma.washingMachine.findFirst({
            where: {
                id: machineData.id,
            },
        });

        if (!currentMachineStatus) {
            logger.error(`Machine with id ${machineData.id} not found`);
            publishMqttMessage(client, {
                type: MESSAGE_TYPE.UPDATE_MACHINE_STATUS,
                payload: {
                    status: 'error',
                    id: machineData.id,
                    message: `Machine with id ${machineData.id} not found`,
                },
            });
            return;
        }

        await prisma.washingMachine.update({
            where: {
                id: machineData.id,
            },
            data: {
                status: machineData.status,
            },
        });

        publishMqttMessage(client, {
            type: MESSAGE_TYPE.UPDATE_MACHINE_STATUS,
            payload: { status: 'success', id: machineData.id },
        });

        if (machineData.status === LaundryStatus.WASHING) {
            await handleOrderWashing(machineData.id);
        }

        if (machineData.status === LaundryStatus.IDLE) {
            const washingPhases = [LaundryStatus.WASHING, LaundryStatus.RINSING, LaundryStatus.SPINNING];
            if (washingPhases.some((phase) => phase === currentMachineStatus.status)) {
                const completedOrder = await handleOrderCompletion(machineData.id);
                if (completedOrder) {
                    await sendCompletionNotification(completedOrder.userId, completedOrder);
                }
            }
            if (currentMachineStatus.status === LaundryStatus.WAITING) {
                const cancelOrder = await handleOrderCancel(machineData.id);
                if (cancelOrder) {
                    await sendCancelNotification(cancelOrder.userId);
                }
            }
        }
    } catch (error) {
        logger.error(`Error updating washing status: ${error}`);
        publishMqttMessage(client, {
            type: MESSAGE_TYPE.UPDATE_MACHINE_STATUS,
            payload: { status: 'error', id: machineData.id, message: error.message },
        });
    }
}

async function handleOrderWashing(machineId: string) {
    try {
        const orders = await prisma.order.findMany({
            where: {
                machineId: machineId,
                status: OrderStatus.PENDING,
            },
        });

        if (orders.length !== 1) {
            logger.warn(`Expected exactly one pending order for machine ${machineId}, but found ${orders.length} pending orders.`);
        }

        const orderToUpdate = orders[0];
        const updatedOrder = await prisma.order.update({
            where: {
                id: orderToUpdate.id,
            },
            data: {
                status: OrderStatus.WASHING,
                washingAt: new Date(),
            },
            select: {
                id: true,
                userId: true,
                status: true,
                machine: {
                    select: {
                        machineNo: true,
                    },
                },
            },
        });

        return updatedOrder;
    } catch (error) {
        logger.error(`Error updating order status: ${error}`);
        throw new Error('Order update failed');
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
            logger.warn(`Expected exactly one washing order for machine ${machineId}, but found ${orders.length} pending orders.`);
        }

        const orderToUpdate = orders[0];
        const updatedOrder = await prisma.order.update({
            where: {
                id: orderToUpdate.id,
            },
            data: {
                status: OrderStatus.FINISHED,
                finishedAt: new Date(),
            },
            select: {
                id: true,
                userId: true,
                status: true,
                machine: {
                    select: {
                        machineNo: true,
                    },
                },
            },
        });

        return updatedOrder;
    } catch (error) {
        logger.error(`Error updating order status: ${error}`);
        throw new Error('Order update failed');
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendCompletionNotification(userId: string, order: any) {
    try {
        const message = {
            notification: {
                title: `Order finished`,
                body: 'Your laundry is done.',
            },
            data: {
                orderId: order.id,
                status: OrderStatus.FINISHED,
                time: new Date().toISOString(),
                machineNumber: order.machine.machineNo.toString(),
            },
        };

        await pushNotification(userId, message);
    } catch (error) {
        logger.error(`Error sending notification: ${error}`);
    }
}

async function handleOrderCancel(machineId: string) {
    try {
        const orders = await prisma.order.findMany({
            where: {
                machineId: machineId,
                status: OrderStatus.PENDING,
            },
        });

        if (orders.length !== 1) {
            logger.warn(`Expected exactly one pending order for machine ${machineId}, but found ${orders.length} pending orders.`);
        }

        const orderToUpdate = orders[0];
        const updatedOrder = await prisma.order.update({
            where: {
                id: orderToUpdate.id,
            },
            data: {
                status: OrderStatus.CANCELLED,
                cancelledAt: new Date(),
            },
            select: {
                id: true,
                userId: true,
                status: true,
                machine: {
                    select: {
                        machineNo: true,
                    },
                },
            },
        });

        return updatedOrder;
    } catch (error) {
        logger.error(`Error updating order status: ${error}`);
        throw new Error('Order update failed');
    }
}

async function sendCancelNotification(userId: string) {
    try {
        const message = {
            notification: {
                title: `Order cancelled`,
                body: 'Your order was cancelled due to exceeding the waiting time. Please place a new order if you wish to continue using the service.',
            },
        };

        await pushNotification(userId, message);
    } catch (error) {
        logger.error(`Error sending notification: ${error}`);
    }
}

export async function updatePowerConsumption(client: MqttClient, data: MqttMessagePayload): Promise<void> {
    const consumptionData = data as { id: string; consumption: number };
    try {
        // Find the latest finished order for this machine that doesn't have power usage data yet
        const order = await prisma.order.findFirst({
            where: {
                machineId: consumptionData.id,
                status: { in: [OrderStatus.FINISHED, OrderStatus.CONFIRMED] },
                finishedAt: {
                    not: null,
                },
                powerUsage: null, // Only find orders that don't have power usage data yet
            },
            orderBy: {
                finishedAt: 'desc',
            },
        });

        if (!order) {
            throw new Error(`No finished order without power usage data found for machine ${consumptionData.id}`);
        }

        // Store power usage data
        await prisma.powerUsageData.create({
            data: {
                orderId: order.id,
                machineId: consumptionData.id,
                totalKwh: consumptionData.consumption,
            },
        });

        // Send success response
        publishMqttMessage(client, {
            type: MESSAGE_TYPE.POWER_CONSUMPTION_UPDATE,
            payload: {
                status: 'success',
                id: consumptionData.id,
            },
        });
    } catch (error) {
        logger.error(`Error updating power consumption: ${error.message}`);
        publishMqttMessage(client, {
            type: MESSAGE_TYPE.POWER_CONSUMPTION_UPDATE,
            payload: {
                status: 'error',
                id: consumptionData.id,
                message: error.message,
            },
        });
    }
}
