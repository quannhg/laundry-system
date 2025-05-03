import { Static, Type } from '@sinclair/typebox';

export const PowerUsageSummaryQueryDto = Type.Object({
    date: Type.Optional(
        Type.String({
            format: 'date-time',
            description: 'Reference date (ISO 8601 format) for summary calculations. Defaults to current date.',
            examples: ['2024-10-26T10:00:00Z'],
        }),
    ),
});

export type PowerUsageSummaryQueryDto = Static<typeof PowerUsageSummaryQueryDto>;
