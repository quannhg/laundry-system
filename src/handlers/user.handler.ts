import { USER_NOT_FOUND } from '@constants';
import { prisma } from '@repositories';
import { UserResultDto } from '@dtos/out';
import { Handler } from '@interfaces';
import { NotificationInputDto } from '../dtos/in/notification.dto';
import { NotificationResultDto } from '../dtos/out/notification.dto';
import { UserInputDto } from '@dtos/in';
import { logger, getUserClassification } from '@utils'; // Import getUserClassification
import { CustomerStatQueryDto } from '@dtos/in';
import { CustomerStatResponseDto } from '@dtos/out';
import { OrderStatus } from '@prisma/client';
// UserClassification is now imported via getUserClassification from @utils

const getUserById: Handler<UserResultDto> = async (req, res) => {
    const userWithOrderCount = await prisma.user.findUnique({
        select: {
            username: true,
            name: true,
            email: true,
            avatarUrl: true,
            phoneNumber: true,
            enableNotification: true,
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

const findUserById: Handler<UserResultDto, { Params: { id: string } }> = async (req, res) => {
    const { id } = req.params; // Lấy ID từ params thay vì req.userId

    const userWithOrderCount = await prisma.user.findUnique({
        select: {
            username: true,
            name: true,
            email: true,
            avatarUrl: true,
            phoneNumber: true,
            enableNotification: true,
            _count: {
                select: { orders: true },
            },
        },
        where: { id }, // Sử dụng ID từ params
    });

    if (userWithOrderCount === null) return res.badRequest(USER_NOT_FOUND);

    return res.send({
        ...userWithOrderCount,
        orderCount: userWithOrderCount._count.orders,
        avatarUrl: 'https://lh3.googleusercontent.com/a/ACg8ocIjkHVXfD15PLabkbAx1TlsWTsTf8sT_mXtwckwxcBV4UtMi4j_=s360-c-no',
    });
};

const updateUser: Handler<UserResultDto, { Body: UserInputDto }> = async (req, res) => {
    const userWithOrderCount = await prisma.user.update({
        select: {
            username: true,
            name: true,
            email: true,
            avatarUrl: true,
            phoneNumber: true,

            enableNotification: true,
            _count: {
                select: { orders: true },
            },
        },
        where: { id: req.userId },
        data: {
            ...req.body,
        },
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

        await prisma.fCMToken.deleteMany({
            where: { userId },
        });

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

// getUserClassification function moved to src/utils/userUtils.ts

const getCustomerStats: Handler<
    CustomerStatResponseDto,
    {
        Querystring: CustomerStatQueryDto;
    }
> = async (req, res) => {
    try {
        const {
            search,
            classification,
            minOrderCount,
            maxOrderCount,
            minSpending,
            maxSpending,
            page = 1,
            limit = 10,
            sortBy = 'orderCount',
            sortOrder = 'desc',
        } = req.query;

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get all users with their order stats
        const users = await prisma.user.findMany({
            where: {
                OR: search
                    ? [
                          { name: { contains: search, mode: 'insensitive' } },
                          { email: { contains: search, mode: 'insensitive' } },
                          { phoneNumber: { contains: search, mode: 'insensitive' } },
                      ]
                    : undefined,
            },
            include: {
                _count: {
                    select: {
                        orders: true,
                    },
                },
                orders: {
                    select: {
                        price: true,
                        status: true,
                    },
                    where: {
                        status: {
                            in: [OrderStatus.FINISHED, OrderStatus.CONFIRMED],
                        },
                    },
                },
            },
        });

        // Process users to calculate statistics and apply filters
        let processedUsers = users.map((user) => {
            const orderCount = user._count.orders;
            const totalSpending = user.orders.reduce((sum, order) => sum + (order.price || 0), 0);
            const userClassification = getUserClassification(orderCount, totalSpending);

            return {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                phoneNumber: user.phoneNumber,
                classification: userClassification,
                orderCount,
                totalSpending,
            };
        });

        // Apply filters
        if (classification) {
            processedUsers = processedUsers.filter((user) => user.classification === classification);
        }
        if (minOrderCount !== undefined) {
            processedUsers = processedUsers.filter((user) => user.orderCount >= minOrderCount);
        }
        if (maxOrderCount !== undefined) {
            processedUsers = processedUsers.filter((user) => user.orderCount <= maxOrderCount);
        }
        if (minSpending !== undefined) {
            processedUsers = processedUsers.filter((user) => user.totalSpending >= minSpending);
        }
        if (maxSpending !== undefined) {
            processedUsers = processedUsers.filter((user) => user.totalSpending <= maxSpending);
        }

        // Get total count after filtering
        const totalCount = processedUsers.length;

        // Sort data
        processedUsers.sort((a, b) => {
            const aValue = a[sortBy as keyof typeof a];
            const bValue = b[sortBy as keyof typeof b];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }

            return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
        });

        // Apply pagination
        const paginatedUsers = processedUsers.slice(skip, skip + limit);

        // Calculate total pages
        const totalPages = Math.ceil(totalCount / limit);

        return res.send({
            customers: paginatedUsers,
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages,
            },
        });
    } catch (error) {
        logger.error(`Error getting customer stats: ${error}`);
        return res.internalServerError(error);
    }
};

export const usersHandler = {
    getUserById,
    updateUser,
    findUserById,
    addFCMToken,
    getCustomerStats,
};
