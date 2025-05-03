import { Static, Type } from '@sinclair/typebox';
import { PeriodType } from './power_usage_chart.dto';

export const PowerUsageStatsQueryDto = Type.Object({
    period: PeriodType,
    date: Type.Optional(
        Type.String({
            format: 'date-time',
            description: 'Reference date (ISO 8601 format) for stats calculations. Defaults to current date.',
            examples: ['2024-10-26T10:00:00Z'],
        }),
    ),
});

export type PowerUsageStatsQueryDto = Static<typeof PowerUsageStatsQueryDto>;
