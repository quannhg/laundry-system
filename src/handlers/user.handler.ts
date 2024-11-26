import { USER_NOT_FOUND } from '@constants';
import { prisma } from '@repositories';
import { UserResultDto } from '@dtos/out';
import { Handler } from '@interfaces';
import { UserInputDto } from '../dtos/in/user.dto';

const getUserById: Handler<UserResultDto, { Params: UserInputDto }> = async (req, res) => {
    const userWithOrderCount = await prisma.user.findUnique({
        select: {
            username: true,
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
        name: 'Quan',
    });
};

export const usersHandler = {
    getUserById,
};
