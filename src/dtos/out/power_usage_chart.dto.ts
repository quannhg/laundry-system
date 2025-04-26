import { Static, Type } from '@sinclair/typebox';
import { PeriodType } from '../in/power_usage_chart.dto';

// Data point in the time series
const PowerUsageDataPointDto = Type.Object({
    timestamp: Type.String(),
    consumption: Type.Number(),
    machineCount: Type.Number(),
    cost: Type.Optional(Type.Number()),
});

// Metadata about the chart data
const ChartMetadataDto = Type.Object({
    period: PeriodType,
    interval: Type.String(),
    startDate: Type.String(),
    endDate: Type.String(),
    totalPoints: Type.Number(),
});

// Complete chart response
export const PowerUsageChartResponseDto = Type.Object({
    data: Type.Array(PowerUsageDataPointDto),
    metadata: ChartMetadataDto,
});

export type PowerUsageDataPointDto = Static<typeof PowerUsageDataPointDto>;
export type ChartMetadataDto = Static<typeof ChartMetadataDto>;
export type PowerUsageChartResponseDto = Static<typeof PowerUsageChartResponseDto>;
