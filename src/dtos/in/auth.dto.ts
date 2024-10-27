import { MIN_USER_NAME_LENGTH, MIN_PASSWORD_LENGTH } from '@constants';
import { Static, Type } from '@sinclair/typebox';

export const AuthInputDto = Type.Object({
    username: Type.String({ minLength: MIN_USER_NAME_LENGTH, default: 'admin@domain.com' }),
    password: Type.String({ minLength: MIN_PASSWORD_LENGTH, default: 'secret_password' })
});

export type AuthInputDto = Static<typeof AuthInputDto>;
