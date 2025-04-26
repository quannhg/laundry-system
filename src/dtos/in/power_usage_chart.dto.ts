import { Static, Type } from '@sinclair/typebox';

export const PeriodType = Type.Union([Type.Literal('day'), Type.Literal('week'), Type.Literal('month'), Type.Literal('year')]);

export const PowerUsageChartQueryDto = Type.Object({
    period: PeriodType,
    startDate: Type.Optional(Type.String()),
});

export type PowerUsageChartQueryDto = Static<typeof PowerUsageChartQueryDto>;
export type PeriodType = Static<typeof PeriodType>;
