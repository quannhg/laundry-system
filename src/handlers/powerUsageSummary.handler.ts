import { Handler } from '@interfaces';
import { prisma } from '@repositories';
import { logger } from '@utils';
import { PowerUsageSummaryResponseDto, PeriodSummaryDto } from '@dtos/out';
type PeriodType = 'day' | 'week' | 'month' | 'year';

/**
 * Calculates the power usage summary for a given period (current vs previous).
 * @param periodType - The type of period ('day', 'week', 'month', 'year').
 * @returns The summary data for the period.
 */
async function getPeriodSummary(periodType: PeriodType): Promise<PeriodSummaryDto> {
    // --- Calculate Date Ranges ---
    const now = new Date();
    let currentStart: Date, currentEnd: Date, previousStart: Date, previousEnd: Date;

    // TODO: Implement logic for 'week', 'month', 'year'
    if (periodType === 'day') {
        // Current Day
        currentStart = new Date(now);
        currentStart.setHours(0, 0, 0, 0);
        currentEnd = new Date(now);
        currentEnd.setHours(23, 59, 59, 999);

        // Previous Day
        previousStart = new Date(currentStart);
        previousStart.setDate(previousStart.getDate() - 1);
        previousEnd = new Date(currentEnd);
        previousEnd.setDate(previousEnd.getDate() - 1);
    } else if (periodType === 'week') {
        // Current Week (assuming week starts on Sunday)
        currentStart = new Date(now);
        currentStart.setDate(now.getDate() - now.getDay()); // Go back to Sunday
        currentStart.setHours(0, 0, 0, 0);
        currentEnd = new Date(currentStart);
        currentEnd.setDate(currentStart.getDate() + 6); // Go forward to Saturday
        currentEnd.setHours(23, 59, 59, 999);

        // Previous Week
        previousStart = new Date(currentStart);
        previousStart.setDate(previousStart.getDate() - 7);
        previousEnd = new Date(currentEnd);
        previousEnd.setDate(previousEnd.getDate() - 7);
    } else if (periodType === 'month') {
        // Current Month
        currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
        currentStart.setHours(0, 0, 0, 0);
        currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
        currentEnd.setHours(23, 59, 59, 999);

        // Previous Month
        previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousStart.setHours(0, 0, 0, 0);
        previousEnd = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of previous month
        previousEnd.setHours(23, 59, 59, 999);
    } else if (periodType === 'year') {
        // Current Year
        currentStart = new Date(now.getFullYear(), 0, 1); // January 1st
        currentStart.setHours(0, 0, 0, 0);
        currentEnd = new Date(now.getFullYear(), 11, 31); // December 31st
        currentEnd.setHours(23, 59, 59, 999);

        // Previous Year
        previousStart = new Date(now.getFullYear() - 1, 0, 1);
        previousStart.setHours(0, 0, 0, 0);
        previousEnd = new Date(now.getFullYear() - 1, 11, 31);
        previousEnd.setHours(23, 59, 59, 999);
    } else {
        // Should not happen with PeriodType, but handle defensively
        throw new Error(`Unsupported period type: ${periodType}`);
    }

    // --- Fetch Data ---
    const fetchTotal = async (start: Date, end: Date): Promise<number> => {
        const result = await prisma.powerUsageData.aggregate({
            _sum: {
                totalKwh: true,
            },
            where: {
                recordedAt: {
                    gte: start,
                    lte: end,
                },
            },
        });
        return result._sum.totalKwh ?? 0;
    };

    const [currentTotal, previousTotal] = await Promise.all([fetchTotal(currentStart, currentEnd), fetchTotal(previousStart, previousEnd)]);

    // --- Calculate Change ---
    let change = 0;
    if (previousTotal > 0) {
        change = ((currentTotal - previousTotal) / previousTotal) * 100;
    } else if (currentTotal > 0) {
        change = 100; // Indicate infinite increase if previous was 0 but current is > 0
    }

    return {
        total: Number(currentTotal.toFixed(2)),
        previous: Number(previousTotal.toFixed(2)),
        change: Number(change.toFixed(2)),
        startDate: currentStart.toISOString(),
        endDate: currentEnd.toISOString(),
    };
}

/**
 * Power Usage Summary Handler
 * Handles requests for aggregated power consumption summaries.
 *
 * @module PowerUsageSummary
 */

/**
 * Retrieves power consumption summaries for day, week, month, and year.
 * Compares current period totals with the previous period.
 *
 * @returns {PowerUsageSummaryResponseDto} Aggregated power usage summaries
 *
 * @throws {500} Database or server error
 */
const getSummary: Handler<PowerUsageSummaryResponseDto> = async (req, res) => {
    try {
        // Fetch summaries for all periods in parallel
        const [daySummary, weekSummary, monthSummary, yearSummary] = await Promise.all([
            getPeriodSummary('day'),
            getPeriodSummary('week'),
            getPeriodSummary('month'),
            getPeriodSummary('year'),
        ]);

        const response: PowerUsageSummaryResponseDto = {
            day: daySummary,
            week: weekSummary,
            month: monthSummary,
            year: yearSummary,
            timestamp: new Date().toISOString(),
        };

        res.status(200).send(response);
    } catch (error) {
        logger.error(`Error getting power usage summary data: ${error}`);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};

export const powerUsageSummaryHandler = {
    getSummary,
};
