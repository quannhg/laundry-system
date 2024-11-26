import { Static, Type } from '@sinclair/typebox';

// create
export const CreateOrderInputDto = Type.Object({
    userId: Type.String(),
    washingMode: Type.String(),
    isSoak: Type.Boolean(),
    paymentMethod: Type.String(),
});
export type CreateOrderInputDto = Static<typeof CreateOrderInputDto>;

// get all
export const GetAllOrderInputDto = Type.Object({
    userId: Type.String(),
});
export type GetAllOrderInputDto = Static<typeof GetAllOrderInputDto>;

// updateStatus
export const UpdateStatusOrderInputDto = Type.Object({
    orderId: Type.String(),
    status: Type.String(),
});
export type UpdateStatusOrderInputDto = Static<typeof UpdateStatusOrderInputDto>;
