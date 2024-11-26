import { Static, Type } from '@sinclair/typebox';

// create
export const CreateOrderResultDto = Type.Object({
    status: Type.String(),
});
export type CreateOrderResultDto = Static<typeof CreateOrderResultDto>;

// get all
export const GetAllOrderResultDto = Type.Object({
    orders: Type.Array(
        Type.Object({
            id: Type.String(),
            userId: Type.String(),
            machineId: Type.String(),
            washingMode: Type.String(),
            status: Type.String(),
            price: Type.Number(),
            isSoak: Type.Boolean(),
            paymentMethod: Type.String(),
        }),
    ),
});
export type GetAllOrderResultDto = Static<typeof GetAllOrderResultDto>;

// updateStatus
export const UpdateStatusOrderResultDto = Type.Object({
    status: Type.String(),
});
export type UpdateStatusOrderResultDto = Static<typeof UpdateStatusOrderResultDto>;
