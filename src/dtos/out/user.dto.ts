import { ObjectId } from '@dtos/common';
import { Static, Type } from '@sinclair/typebox';

export const UserResultDto = Type.Object({
    id: ObjectId,
    username: Type.String(),
    email: Type.String(),
    avatarUrl: Type.String(),
    phoneNumber: Type.String(),
    orderCount: Type.Number(),
});

export type UserResultDto = Static<typeof UserResultDto>;
