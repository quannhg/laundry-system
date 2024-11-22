import { prisma } from '@repositories';
import { Handler } from '@interfaces';
import { logger } from '@utils';
import { CreateOrderInputDto } from '../dtos/in/order.dto';
import { CreateOrderResultDto } from '../dtos/out/order.dto';
import { WashingMode } from '@prisma/client';

const create: Handler<CreateOrderResultDto, { Body: CreateOrderInputDto }> = async (req, res) => {
    try {
        const { userId, washingMode } = req.body;

        const washingMachine = await prisma.washingMachine.findFirst({
            where: {
                status: 'IDLE',
            },
        });

        if (!washingMachine) {
            return res.status(400).send({ error: 'No idle washing machine available' });
        }

        let washingModeDb;
        switch (washingMode) {
            case 'normal':
                washingModeDb = WashingMode.NORMAL;
                break;
            case 'thoroughly':
                washingModeDb = WashingMode.THOROUGHLY;
                break;
            case 'soak':
                washingModeDb = WashingMode.SOAK;
                break;
            default:
                return res.status(400).send({ error: 'Invalid washing mode' });
        }

        const order = await prisma.order.create({
            data: {
                userId,
                machineId: washingMachine.id,
                washingMode: washingModeDb,
                status: 'PENDING',
            },
        });

        res.status(201).send(order);
    } catch (error) {
        logger.error('Error creating order:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};

export const ordersHandle = {
    create,
};
