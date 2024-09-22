import { AuthResultDto } from '@dtos/out';
import { authHandler } from '@handlers';
import { Type } from '@sinclair/typebox';
import { createRoutes } from '@utils';

export const authPlugin = createRoutes('Auth', [
    {
        method: 'POST',
        url: '/google/auth',
        schema: {
            summary: 'Redirect URL of google auth',
            response: {
                200: AuthResultDto
            }
        },
        handler: authHandler.googleOAuth
    },
    {
        method: 'DELETE',
        url: '/logout',
        schema: {
            response: {
                200: Type.Null()
            }
        },
        handler: authHandler.logout
    }
]);
