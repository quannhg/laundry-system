import { Static, Type } from '@sinclair/typebox';

export const CreatingWashingMachineInputDto = Type.Object({
    machineNo: Type.Number(),
});

export type CreatingWashingMachineInputDto = Static<typeof CreatingWashingMachineInputDto>;
