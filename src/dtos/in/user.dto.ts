import { Static, Type } from '@sinclair/typebox';

export const UserInputDto = Type.Object({
    id: Type.String(),
});

export type UserInputDto = Static<typeof UserInputDto>;
