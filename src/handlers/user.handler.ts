import { USER_NOT_FOUND } from '@constants';
import { prisma } from '@repositories';
import { UserResultDto } from '@dtos/out';
import { Handler } from '@interfaces';
import { UserInputDto } from '../dtos/in/user.dto';
import { NotificationInputDto } from '../dtos/in/notification.dto';
import { NotificationResultDto } from '../dtos/out/notification.dto';

const getUserById: Handler<UserResultDto, { Params: UserInputDto }> = async (req, res) => {
    const userWithOrderCount = await prisma.user.findUnique({
        select: {
            username: true,
            name: true,
            email: true,
            avatarUrl: true,
            phoneNumber: true,
            _count: {
                select: { orders: true },
            },
        },
        where: { id: req.userId },
    });
    if (userWithOrderCount === null) return res.badRequest(USER_NOT_FOUND);
    return res.send({
        ...userWithOrderCount,
        orderCount: userWithOrderCount._count.orders,
        avatarUrl: 'https://lh3.googleusercontent.com/a/ACg8ocIjkHVXfD15PLabkbAx1TlsWTsTf8sT_mXtwckwxcBV4UtMi4j_=s360-c-no',
    });
};

const addFCMToken: Handler<NotificationResultDto, { Body: NotificationInputDto }> = async (req, res) => {
    try {
        const { token } = req.body;
        const userId = req.userId;

        await prisma.fCMToken.create({
            data: {
                token,
                userId,
            },
        });

        return res.send({ status: 'success' });
    } catch (error) {
        return res.status(500).send({ status: 'error', message: error.message });
    }
};

export const usersHandler = {
    getUserById,
    addFCMToken,
};
