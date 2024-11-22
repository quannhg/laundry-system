import { Static, Type } from '@sinclair/typebox';

export const CreateOrderResultDto = Type.Object({
    userId: Type.String(),
    washingMode: Type.String(),
});

export type CreateOrderResultDto = Static<typeof CreateOrderResultDto>;
