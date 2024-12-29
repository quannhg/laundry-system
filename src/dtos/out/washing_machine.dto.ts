import { Static, Type } from '@sinclair/typebox';

export const WashingMachineDto = Type.Object({
    idle: Type.Number(),
    washing: Type.Number(),
    dry: Type.Number(),
});

export type WashingMachineDto = Static<typeof WashingMachineDto>;

export const CreatingWashingMachineResultDto = Type.Object({
    id: Type.String(),
    status: Type.String(),
    machineNo: Type.Number(),
});

export type CreatingWashingMachineResultDto = Static<typeof CreatingWashingMachineResultDto>;
