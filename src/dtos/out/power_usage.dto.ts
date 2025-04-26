import { Static, Type } from '@sinclair/typebox';

export const PowerUsageDataDto = Type.Object({
    id: Type.String(),
    machineId: Type.String(),
    machineNo: Type.Number(),
    totalKwh: Type.Number(),
    recordedAt: Type.String(),
    order: Type.Object({
        id: Type.String(),
        status: Type.String(),
        washingMode: Type.String(),
        isSoak: Type.Boolean(),
        washingAt: Type.Union([Type.String(), Type.Null()]),
        finishedAt: Type.Union([Type.String(), Type.Null()]),
    }),
});

export const GetPowerUsageResultDto = Type.Object({
    powerUsageData: Type.Array(PowerUsageDataDto),
});

export type PowerUsageDataDto = Static<typeof PowerUsageDataDto>;
export type GetPowerUsageResultDto = Static<typeof GetPowerUsageResultDto>;
