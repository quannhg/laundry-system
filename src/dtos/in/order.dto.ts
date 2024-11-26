import { Static, Type } from '@sinclair/typebox';

// create
export const CreateOrderInputDto = Type.Object({
    washingMode: Type.String(),
    isSoak: Type.Boolean(),
    paymentMethod: Type.String(),
});
export type CreateOrderInputDto = Static<typeof CreateOrderInputDto>;

// updateStatus
export const UpdateStatusOrderInputDto = Type.Object({
    orderId: Type.String(),
    status: Type.String(),
});
export type UpdateStatusOrderInputDto = Static<typeof UpdateStatusOrderInputDto>;
