import { UserResultDto } from '@dtos/out';
import { usersHandler } from '@handlers';
import { createRoutes } from '@utils';
import { UserInputDto } from '../../dtos/in/user.dto';

export const userPlugin = createRoutes('User', [
    {
        method: 'GET',
        url: '/:id',
        schema: {
            params: UserInputDto,
            response: {
                200: UserResultDto,
            },
        },
        handler: usersHandler.getUserById,
    },
]);
