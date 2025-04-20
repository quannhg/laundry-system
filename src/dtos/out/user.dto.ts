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

// Customer statistics DTO
export const CustomerStatItemDto = Type.Object({
    id: Type.String(),
    name: Type.Union([Type.String(), Type.Null()]),
    username: Type.Union([Type.String(), Type.Null()]),
    email: Type.Union([Type.String(), Type.Null()]),
    phoneNumber: Type.Union([Type.String(), Type.Null()]),
    classification: Type.String(), // VIP, Regular, New, etc.
    orderCount: Type.Number(),
    totalSpending: Type.Number(),
});

export const CustomerStatResponseDto = Type.Object({
    customers: Type.Array(CustomerStatItemDto),
    pagination: Type.Object({
        total: Type.Number(),
        page: Type.Number(),
        limit: Type.Number(),
        totalPages: Type.Number(),
    }),
});

export type CustomerStatItemDto = Static<typeof CustomerStatItemDto>;
export type CustomerStatResponseDto = Static<typeof CustomerStatResponseDto>;
