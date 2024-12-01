import { UserResultDto } from '@dtos/out';
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
