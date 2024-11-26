import { UserResultDto } from '@dtos/out';
import { usersHandler } from '@handlers';
import { createRoutes } from '@utils';

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
]);
