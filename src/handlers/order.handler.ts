import { prisma } from '@repositories';
import { Handler } from '@interfaces';
import { logger } from '@utils';
import { CreateOrderInputDto, UpdateStatusOrderInputDto } from '@dtos/in';
import { CreateOrderResultDto, GetAllOrderResultDto, UpdateStatusOrderResultDto } from '@dtos/out';
import { WashingMode, OrderStatus } from '@prisma/client';
import { MESSAGE_TYPE, MQTT_TO_HARDWARE_TOPIC, PaymentMethod, SoakPrice, WashingPrice } from '@constants';
import { pushNotification } from '@utils';
import { mqttClient } from '../mqtt/client';

const create: Handler<CreateOrderResultDto, { Body: CreateOrderInputDto }> = async (req, res) => {
    try {
        const { washingMode, isSoak, paymentMethod } = req.body;
        if (!PaymentMethod.includes(paymentMethod)) {
            return res.status(400).send({ error: 'Invalid payment method' });
        }
        const washingMachine = await prisma.washingMachine.findFirst({
            where: {
                status: 'IDLE',
            },
        });
        if (!washingMachine) {
            return res.status(400).send({ error: 'No idle washing machine available' });
        }
        let washingModeDb;
        let washingPrice;
        switch (washingMode) {
            case 'normal':
                washingModeDb = WashingMode.NORMAL;
                washingPrice = WashingPrice.NORMAL;
                break;
            case 'thoroughly':
                washingModeDb = WashingMode.THOROUGHLY;
                washingPrice = WashingPrice.THOROUGHLY;
                break;
            default:
                return res.status(400).send({ error: 'Invalid washing mode' });
        }
        if (isSoak) {
            washingPrice += SoakPrice;
        }
        const order = await prisma.order.create({
            data: {
                userId: req.userId,
                machineId: washingMachine.id,
                washingMode: washingModeDb,
                status: OrderStatus.PENDING,
                price: washingPrice,
                isSoak: isSoak,
                paymentMethod,
                authCode: Math.floor(100000 + Math.random() * 900000).toString(),
            },
            select: {
                id: true,
                userId: true,
                authCode: true,
                price: true,
                status: true,
                washingMode: true,
                isSoak: true,
                paymentMethod: true,
                createdAt: true,
                updatedAt: true,
                washingAt: true,
                finishedAt: true,
                machine: {
                    select: {
                        id: true,
                        machineNo: true,
                        status: true,
                    },
                },
            },
        });

        mqttClient.publish(
            MQTT_TO_HARDWARE_TOPIC,
            JSON.stringify({
                type: MESSAGE_TYPE.SEND_AUTHENTICATION_CODE,
                payload: { id: order.machine.id, code: order.authCode },
            }),
        );

        // Send notification about the order creation
        await sendCreatingNotification(req.userId, order);

        const responseOrder = {
            id: order.id,
            userId: order.userId,
            authCode: order.authCode,
            price: order.price,
            status: order.status,
            washingMode: order.washingMode,
            isSoak: order.isSoak,
            paymentMethod: order.paymentMethod,
            createAt: order.createdAt.toISOString(),
            washingAt: order.washingAt?.toISOString() ?? null,
            finishedAt: order.finishedAt?.toISOString() ?? null,
            cancelledAt: null,
            machineId: order.machine.id,
            machineNo: order.machine.machineNo,
            washingStatus: order.machine.status,
        };

        res.status(201).send(responseOrder);
    } catch (error) {
        logger.error(`Error creating order: ${error}`);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};
const getAll: Handler<GetAllOrderResultDto> = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: req.userId },
            select: {
                id: true,
                userId: true,
                authCode: true,
                price: true,
                status: true,
                washingMode: true,
                isSoak: true,
                paymentMethod: true,
                createdAt: true,
                updatedAt: true,
                washingAt: true,
                cancelledAt: true,
                finishedAt: true,
                machine: {
                    select: {
                        id: true,
                        machineNo: true,
                        status: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        const responseOrder = orders.map((order) => {
            return {
                id: order.id,
                userId: order.userId,
                authCode: order.authCode,
                price: order.price,
                status: order.status,
                washingMode: order.washingMode,
                isSoak: order.isSoak,
                paymentMethod: order.paymentMethod,
                createAt: order.createdAt.toISOString(),
                washingAt: order.washingAt?.toISOString() ?? null,
                finishedAt: order.finishedAt?.toISOString() ?? null,
                cancelledAt: order.cancelledAt?.toISOString() ?? null,
                machineId: order.machine.id,
                machineNo: order.machine.machineNo,
                washingStatus: order.machine.status,
            };
        });

        res.status(200).send({ orders: responseOrder });
    } catch (error) {
        logger.error(`Error getting all orders: ${error}`);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};
const updateStatus: Handler<UpdateStatusOrderResultDto, { Body: UpdateStatusOrderInputDto }> = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        let orderStatusDb;
        switch (status.toLowerCase()) {
            case 'pending':
                orderStatusDb = OrderStatus.PENDING;
                break;
            case 'washing':
                orderStatusDb = OrderStatus.WASHING;
                break;
            case 'finished':
                orderStatusDb = OrderStatus.FINISHED;
                break;
            case 'confirmed':
                orderStatusDb = OrderStatus.CONFIRMED;
                break;
            case 'cancelled':
                orderStatusDb = OrderStatus.CANCELLED;
                break;
            case 'refunded':
                orderStatusDb = OrderStatus.REFUNDED;
                break;
            default:
                return res.status(400).send({ error: 'Invalid status' });
        }
        const order = await prisma.order.update({
            where: {
                id: orderId,
            },
            data: {
                status: orderStatusDb,
                cancelledAt: orderStatusDb === OrderStatus.CANCELLED ? new Date() : undefined,
            },
        });

        res.status(200).send(order);
    } catch (error) {
        logger.error(`Error updating order status: ${error}`);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendCreatingNotification(userId: string, order: any) {
    try {
        const message = {
            notification: {
                title: 'Order Created',
                body: `Your order has been successfully created.`,
            },
            data: {
                orderId: order.id,
                status: OrderStatus.PENDING,
                time: new Date().toISOString(),
                orderCode: order.authCode,
                machineNumber: order.machine.machineNo.toString(),
            },
        };

        await pushNotification(userId, message);
    } catch (error) {
        logger.error(`Error sending notification: ${error}`);
    }
}

const remove: Handler<{ success: boolean }, { Params: { id: string } }> = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.order.delete({
            where: { id: id },
        });
        res.status(200).send({ success: true });
    } catch (error) {
        logger.error(`Error removing order: ${error}`);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};

const removeAll: Handler<{ success: boolean }> = async (_req, res) => {
    try {
        await prisma.order.deleteMany({});
        res.status(200).send({ success: true });
    } catch (error) {
        logger.error(`Error removing order: ${error}`);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};

export const ordersHandle = {
    create,
    getAll,
    updateStatus,
    remove,
    removeAll,
};
