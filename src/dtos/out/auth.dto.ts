import { ObjectId } from '@dtos/common';
import { Static, Type } from '@sinclair/typebox';

export const AuthResultDto = Type.Object({
    id: ObjectId,
    username: Type.String(),
    token: Type.String(),
});

export type AuthResultDto = Static<typeof AuthResultDto>;
