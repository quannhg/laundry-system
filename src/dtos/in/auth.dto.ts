import { MIN_USER_NAME_LENGTH, MIN_PASSWORD_LENGTH } from '@constants';
import { Static, Type } from '@sinclair/typebox';

export const AuthInputDto = Type.Object(
    {
        username: Type.String({ minLength: MIN_USER_NAME_LENGTH, default: 'admin@domain.com' }),
        password: Type.String({ minLength: MIN_PASSWORD_LENGTH, default: 'secret_password' }),
    },
    {
        examples: [
            {
                username: 'admin@domain.com',
                password: 'secret_password',
            },
            {
                username: 'nguyen.hong.quan@example.com',
                password: 'password123',
            },
            {
                username: 'pham.van.nhat.vu@example.com',
                password: 'password123',
            },
        ],
    },
);

export type AuthInputDto = Static<typeof AuthInputDto>;
