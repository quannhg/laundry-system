import { Static, Type } from '@sinclair/typebox';

export const UserResultDto = Type.Object({
    username: Type.String(),
    name: Type.String(),
    email: Type.String(),
    avatarUrl: Type.String(),
    phoneNumber: Type.String(),
    orderCount: Type.Number(),
    enableNotification: Type.Boolean(),
});

export type UserResultDto = Static<typeof UserResultDto>;
