import { Static, Type } from '@sinclair/typebox';

export const WashingMachineDto = Type.Object({
    idle: Type.Number(),
    washing: Type.Number(),
    dry: Type.Number(),
});

export type WashingMachineDto = Static<typeof WashingMachineDto>;
