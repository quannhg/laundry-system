import { Static, Type } from '@sinclair/typebox';

// Basic machine list item
export const MachineListItemV2Dto = Type.Array(
    Type.Object({
        id: Type.String(),
        machineNo: Type.Number(),
        status: Type.String(),
    }),
);

// Machine details
export const MachineDetailsV2Dto = Type.Object({
    id: Type.String(),
    machineNo: Type.Number(),
    status: Type.String(),
});

// Machine statistics
export const MachineStatisticsV2Dto = Type.Object({
    totalOrders: Type.Number(),
    totalPowerUsage: Type.Number(),
});

export type MachineListItemV2Dto = Static<typeof MachineListItemV2Dto>;
export type MachineDetailsV2Dto = Static<typeof MachineDetailsV2Dto>;
export type MachineStatisticsV2Dto = Static<typeof MachineStatisticsV2Dto>;
