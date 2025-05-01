import { Static, Type } from '@sinclair/typebox';

// Create Order Result
export const CreateOrderResultDto = Type.Object({
    id: Type.String(),
    userId: Type.String(),
    authCode: Type.String(),
    price: Type.Number(),
    status: Type.String(),
    washingMode: Type.String(),
    isSoak: Type.Boolean(),
    paymentMethod: Type.String(),
    createAt: Type.String(),
    washingAt: Type.Union([Type.String(), Type.Null()]),
    finishedAt: Type.Union([Type.String(), Type.Null()]),
    cancelledAt: Type.Union([Type.String(), Type.Null()]),
    machineId: Type.String(),
    machineNo: Type.String(),
    washingStatus: Type.String(),
});

// Get All Orders Result
export const GetAllOrderResultDto = Type.Object({
    orders: Type.Array(CreateOrderResultDto),
});

// Get Order By Id Result
export const GetOrderByIdResultDto = Type.Object({
    id: Type.String(),
    userId: Type.String(),
    status: Type.String(),
    price: Type.Number(),
    isSoak: Type.Boolean(),
    paymentMethod: Type.String(),
    washingStatus: Type.String(),
    authCode: Type.String(),
    createAt: Type.String(),
    washingAt: Type.Union([Type.String(), Type.Null()]),
    finishedAt: Type.Union([Type.String(), Type.Null()]),
    cancelledAt: Type.Union([Type.String(), Type.Null()]),
    machineId: Type.String(),
    machineNo: Type.Number(),
    washingMode: Type.String(),
});

// Update Status Result
export const UpdateStatusOrderResultDto = Type.Object({
    status: Type.String(),
});

// Search Orders Result
export const SearchOrdersResultDto = Type.Object({
    orders: Type.Array(
        Type.Object({
            id: Type.String(),
            userId: Type.String(),
            status: Type.String(),
            price: Type.Number(),
            isSoak: Type.Boolean(),
            paymentMethod: Type.String(),
            washingStatus: Type.String(),
            authCode: Type.String(),
            createAt: Type.String(),
            washingAt: Type.Union([Type.String(), Type.Null()]),
            finishedAt: Type.Union([Type.String(), Type.Null()]),
            cancelledAt: Type.Union([Type.String(), Type.Null()]),
            machineId: Type.String(),
            machineNo: Type.String(),
            washingMode: Type.String(),
            user: Type.Object({
                name: Type.Union([Type.String(), Type.Null()]),
                email: Type.Union([Type.String(), Type.Null()]),
            }),
        }),
    ),
    pagination: Type.Object({
        total: Type.Number(),
        page: Type.Number(),
        limit: Type.Number(),
        totalPages: Type.Number(),
    }),
});

export type CreateOrderResultDto = Static<typeof CreateOrderResultDto>;
export type GetAllOrderResultDto = Static<typeof GetAllOrderResultDto>;
export type GetOrderByIdResultDto = Static<typeof GetOrderByIdResultDto>;
export type UpdateStatusOrderResultDto = Static<typeof UpdateStatusOrderResultDto>;
export type SearchOrdersResultDto = Static<typeof SearchOrdersResultDto>;
