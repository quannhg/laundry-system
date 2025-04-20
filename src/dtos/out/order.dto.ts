import { Static, Type } from '@sinclair/typebox';

// create
export const CreateOrderResultDto = Type.Object({
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
});
export type CreateOrderResultDto = Static<typeof CreateOrderResultDto>;

// get all
export const GetAllOrderResultDto = Type.Object({
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
        }),
    ),
});
export type GetAllOrderResultDto = Static<typeof GetAllOrderResultDto>;

// updateStatus
export const UpdateStatusOrderResultDto = Type.Object({
    status: Type.String(),
});
export type UpdateStatusOrderResultDto = Static<typeof UpdateStatusOrderResultDto>;

// searchOrders
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
export type SearchOrdersResultDto = Static<typeof SearchOrdersResultDto>;
