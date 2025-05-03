import { Static, Type } from '@sinclair/typebox';
import { UserClassification } from '../common/enums.dto'; // Import the enum

// Define the structure for a single customer in the stats response
const CustomerStatItemDto = Type.Object({
    id: Type.String(),
    name: Type.Optional(Type.String()),
    username: Type.Optional(Type.String()),
    email: Type.Optional(Type.String()),
    phoneNumber: Type.Optional(Type.String()),
    classification: Type.Enum(UserClassification, { description: 'Customer classification based on activity' }),
    orderCount: Type.Number({ description: 'Total number of orders' }),
    totalSpending: Type.Number({ description: 'Total amount spent across orders' }),
});

// Define the pagination structure
const PaginationDto = Type.Object({
    total: Type.Number(),
    page: Type.Number(),
    limit: Type.Number(),
    totalPages: Type.Number(),
});

// Define the main response DTO for customer stats
export const CustomerStatResponseDto = Type.Object({
    customers: Type.Array(CustomerStatItemDto),
    pagination: PaginationDto,
});

export type CustomerStatResponseDto = Static<typeof CustomerStatResponseDto>;

// Existing UserResultDto (assuming it's used elsewhere, keep it defined or import if separate)
export const UserResultDto = Type.Object({
    username: Type.Optional(Type.String()),
    name: Type.Optional(Type.String()),
    email: Type.Optional(Type.String()),
    avatarUrl: Type.Optional(Type.String()),
    phoneNumber: Type.Optional(Type.String()),
    enableNotification: Type.Optional(Type.Boolean()),
    orderCount: Type.Optional(Type.Number()), // Added based on handler usage
});

export type UserResultDto = Static<typeof UserResultDto>;
