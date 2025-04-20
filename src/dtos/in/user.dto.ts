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

// Customer statistics query DTO
export const CustomerStatQueryDto = Type.Object({
    search: Type.Optional(Type.String()), // Search by name, email, or phone
    classification: Type.Optional(Type.String()), // Filter by classification
    minOrderCount: Type.Optional(Type.Number()), // Minimum number of orders
    maxOrderCount: Type.Optional(Type.Number()), // Maximum number of orders
    minSpending: Type.Optional(Type.Number()), // Minimum total spending
    maxSpending: Type.Optional(Type.Number()), // Maximum total spending
    page: Type.Optional(Type.Number()), // Page number for pagination
    limit: Type.Optional(Type.Number()), // Items per page
    sortBy: Type.Optional(Type.String()), // Field to sort by
    sortOrder: Type.Optional(Type.String()), // 'asc' or 'desc'
});

export type CustomerStatQueryDto = Static<typeof CustomerStatQueryDto>;
