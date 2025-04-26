import { Static, Type } from '@sinclair/typebox';

export const GetPowerUsageInputDto = Type.Object({
    machineId: Type.Optional(Type.String()),
    startDate: Type.Optional(Type.String()),
    endDate: Type.Optional(Type.String()),
});
export type GetPowerUsageInputDto = Static<typeof GetPowerUsageInputDto>;
