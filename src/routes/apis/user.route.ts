import { CustomerStatQueryDto, UserInputDto } from '@dtos/in';
import { CustomerStatResponseDto, UserResultDto } from '@dtos/out';
import { usersHandler } from '@handlers';
import { createRoutes } from '@utils';
import { NotificationResultDto } from '../../dtos/out/notification.dto';
import { NotificationInputDto } from '../../dtos/in/notification.dto';

export const userPlugin = createRoutes('User', [
    {
        method: 'GET',
        url: '/',
        schema: {
            response: {
                200: UserResultDto,
            },
            security: [{ bearerAuth: [] }],
        },
        handler: usersHandler.getUserById,
    },
    {
        method: 'GET',
        url: '/:id',
        schema: {
            params: { id: { type: 'string' } },
            response: {
                200: UserResultDto,
            },
            security: [{ bearerAuth: [] }],
        },
        handler: usersHandler.findUserById,
    },
    {
        method: 'GET',
        url: '/stats/customers',
        schema: {
            querystring: CustomerStatQueryDto,
            response: {
                200: CustomerStatResponseDto,
            },
            security: [{ bearerAuth: [] }],
        },
        handler: usersHandler.getCustomerStats,
    },
    {
        method: 'PUT',
        url: '/',
        schema: {
            body: UserInputDto,
            response: {
                200: UserResultDto,
            },
            security: [{ bearerAuth: [] }],
        },
        handler: usersHandler.updateUser,
    },
    {
        method: 'POST',
        url: '/fcm-token',
        schema: {
            body: NotificationInputDto,
            response: {
                200: NotificationResultDto,
            },
            security: [{ bearerAuth: [] }],
        },
        handler: usersHandler.addFCMToken,
    },
]);
