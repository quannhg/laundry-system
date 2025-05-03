import { Handler } from '@interfaces';
import { prisma } from '@repositories';
import { logger, getPeriodDates } from '@utils'; // Import getPeriodDates
import { PowerUsageSummaryResponseDto, PeriodSummaryDto } from '@dtos/out';
import { PeriodType, PowerUsageSummaryQueryDto } from '@dtos/in'; // Import Query DTO

/**
 * Calculates the power usage summary for a given period (current vs previous) based on a reference date.
 * @param periodType - The type of period ('day', 'week', 'month', 'year').
 * @param referenceDate - The date to base the calculations on.
 * @returns The summary data for the period.
 */
async function getPeriodSummary(periodType: PeriodType, referenceDate: Date): Promise<PeriodSummaryDto> {
    // --- Calculate Date Ranges using getPeriodDates ---

    // Calculate Current Period
    const { start: currentStart, end: currentEnd } = getPeriodDates(periodType, referenceDate);

    // Calculate Previous Period Reference Date
    let previousReferenceDate: Date;
    switch (periodType) {
        case 'day':
            previousReferenceDate = new Date(currentStart);
            previousReferenceDate.setDate(currentStart.getDate() - 1);
            break;
        case 'week':
            previousReferenceDate = new Date(currentStart);
            previousReferenceDate.setDate(currentStart.getDate() - 7);
            break;
        case 'month':
            previousReferenceDate = new Date(currentStart);
            previousReferenceDate.setMonth(currentStart.getMonth() - 1);
            break;
        case 'year':
            previousReferenceDate = new Date(currentStart);
            previousReferenceDate.setFullYear(currentStart.getFullYear() - 1);
            break;
        default:
            // This should be exhaustive based on PeriodType definition
            throw new Error(`Unsupported period type: ${periodType}`);
    }

    // Calculate Previous Period
    const { start: previousStart, end: previousEnd } = getPeriodDates(periodType, previousReferenceDate);

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
 * @param {Object} req.query.date - Optional reference date (ISO 8601 format)
 * @returns {PowerUsageSummaryResponseDto} Aggregated power usage summaries
 *
 * @throws {400} Invalid date format
 * @throws {500} Database or server error
 */
const getSummary: Handler<PowerUsageSummaryResponseDto, { Querystring: PowerUsageSummaryQueryDto }> = async (req, res) => {
    try {
        const { date: dateStr } = req.query;
        const referenceDate = dateStr ? new Date(dateStr) : new Date();

        // Validate date
        if (isNaN(referenceDate.getTime())) {
            logger.warn(`Invalid date format received: ${dateStr}`);
            return res.status(400).send({ error: 'Invalid date format. Please use ISO 8601 format.' });
        }

        // Fetch summaries for all periods in parallel, passing the reference date
        const [daySummary, weekSummary, monthSummary, yearSummary] = await Promise.all([
            getPeriodSummary('day', referenceDate),
            getPeriodSummary('week', referenceDate),
            getPeriodSummary('month', referenceDate),
            getPeriodSummary('year', referenceDate),
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
