import { Static, Type } from '@sinclair/typebox';

// Single period summary
const PeriodSummaryDto = Type.Object({
    total: Type.Number(),
    previous: Type.Number(),
    change: Type.Number(), // Percentage change
    startDate: Type.String(),
    endDate: Type.String(),
});

// Complete summary response
export const PowerUsageSummaryResponseDto = Type.Object({
    day: PeriodSummaryDto,
    week: PeriodSummaryDto,
    month: PeriodSummaryDto,
    year: PeriodSummaryDto,
    timestamp: Type.String(), // When this summary was generated
});

export type PeriodSummaryDto = Static<typeof PeriodSummaryDto>;
export type PowerUsageSummaryResponseDto = Static<typeof PowerUsageSummaryResponseDto>;

/**
 * Example Response:
 * {
 *   "day": {
 *     "total": 125.5,      // kWh
 *     "previous": 118.2,   // Previous day's total
 *     "change": 6.18,      // % increase
 *     "startDate": "2025-04-26T00:00:00Z",
 *     "endDate": "2025-04-26T23:59:59Z"
 *   },
 *   "week": { ... },
 *   "month": { ... },
 *   "year": { ... },
 *   "timestamp": "2025-04-26T16:14:43Z"
 * }
 */
