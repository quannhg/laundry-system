import { prisma } from '@repositories';
import { Handler } from '@interfaces';
import { logger } from '@utils';
import { CreateOrderInputDto, UpdateStatusOrderInputDto } from '@dtos/in';
import { CreateOrderResultDto, GetAllOrderResultDto, UpdateStatusOrderResultDto } from '@dtos/out';
import { WashingMode, OrderStatus } from '@prisma/client';
import { PaymentMethod, SoakPrice, WashingPrice } from '@constants';
import admin from 'firebase-admin';
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
                authCode: true,
                price: true,
                status: true,
                washingMode: true,
                isSoak: true,
                paymentMethod: true,
                createdAt: true,
                updatedAt: true,
                machine: {
                    select: {
                        machineNo: true,
                    },
                },
            },
        });

        // Send notification about the order creation
        await sendCreatingNotification(req.userId, order);

        res.status(201).send(order);
    } catch (error) {
        logger.error(`Error creating order: ${error}`);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};
const getAll: Handler<GetAllOrderResultDto> = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: req.userId },
        });
        res.status(200).send({ orders });
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
        const userToken = await prisma.fCMToken.findFirst({ where: { userId } });

        if (!userToken) {
            logger.warn(`No FCM tokens found for user ${userId}`);
            return;
        }

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
            token: userToken.token,
        };

        await admin.messaging().send(message);
    } catch (error) {
        logger.error(`Error sending notification: ${error}`);
    }
}

export const ordersHandle = {
    create,
    getAll,
    updateStatus,
};
