import { ObjectId } from '@dtos/common';
import { Static, Type } from '@sinclair/typebox';

export const WashingMachineDto = Type.Object({
    id: ObjectId,
    status: Type.String()
});

export type WashingMachineDto = Static<typeof WashingMachineDto>;
