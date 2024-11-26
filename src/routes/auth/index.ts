import { AuthResultDto } from '@dtos/out';
import { authHandler, googleAuthHandler, logoutHandler } from '@handlers';
import { Type } from '@sinclair/typebox';
import { createRoutes } from '@utils';
import { AuthInputDto } from '@dtos/in';

export const authPlugin = createRoutes('Auth', [
    {
        method: 'POST',
        url: '/google/auth',
        schema: {
            summary: 'Redirect URL of google auth',
            response: {
                200: AuthResultDto,
            },
        },
        handler: googleAuthHandler.googleOAuth,
    },
    {
        method: 'POST',
        url: '/login',
        schema: {
            body: AuthInputDto,
            response: {
                200: AuthResultDto,
            },
        },
        handler: authHandler.login,
    },
    {
        method: 'POST',
        url: '/signup',
        schema: {
            body: AuthInputDto,
            response: {
                200: AuthResultDto,
            },
        },
        handler: authHandler.signup,
    },
    {
        method: 'DELETE',
        url: '/logout',
        schema: {
            response: {
                200: Type.Null(),
            },
        },
        handler: logoutHandler.logout,
    },
]);
