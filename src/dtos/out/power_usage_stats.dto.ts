import { Static, Type } from '@sinclair/typebox';

export const PowerUsageStatsResponseDto = Type.Object({
    energyConsumed: Type.Number({
        description: 'Total energy consumed in kWh during the period.',
        examples: [123.45],
    }),
    totalWashCount: Type.Number({
        description: 'Total number of completed wash cycles during the period.',
        examples: [50],
    }),
    totalCost: Type.Number({
        description: 'Estimated total cost of energy consumed during the period.',
        examples: [14.81],
    }),
    startDate: Type.String({
        format: 'date-time',
        description: 'The start date of the period calculated.',
    }),
    endDate: Type.String({
        format: 'date-time',
        description: 'The end date of the period calculated.',
    }),
});

export type PowerUsageStatsResponseDto = Static<typeof PowerUsageStatsResponseDto>;
