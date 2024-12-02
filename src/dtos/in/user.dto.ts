import { Static, Type } from '@sinclair/typebox';

export const UserInputDto = Type.Object({
    username: Type.Optional(Type.String()),
    name: Type.Optional(Type.String()),
    email: Type.Optional(Type.String()),
    avatarUrl: Type.Optional(Type.String()),
    phoneNumber: Type.Optional(Type.String()),
    enableNotification: Type.Optional(Type.Boolean()),
});

export type UserInputDto = Static<typeof UserInputDto>;
