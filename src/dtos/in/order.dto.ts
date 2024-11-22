import { Static, Type } from '@sinclair/typebox';

export const CreateOrderInputDto = Type.Object({
    userId: Type.String(),
    washingMode: Type.String(),
});

export type CreateOrderInputDto = Static<typeof CreateOrderInputDto>;
