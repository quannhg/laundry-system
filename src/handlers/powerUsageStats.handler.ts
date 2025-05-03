import { Handler } from '@interfaces';
import { prisma } from '@repositories';
import { logger, getPeriodDates } from '@utils';
import { PowerUsageStatsQueryDto } from '@dtos/in';
import { PowerUsageStatsResponseDto } from '@dtos/out';
import { OrderStatus } from '@prisma/client';

// --- Vietnamese Electricity Pricing (Residential, Approximate Rates in VND/kWh, Excluding VAT) ---
// TODO: Move to config/database and add VAT handling if needed
const vndTiers = [
    { limit: 50, rate: 1806 }, // Tier 1: 0-50 kWh
    { limit: 100, rate: 1866 }, // Tier 2: 51-100 kWh
    { limit: 200, rate: 2167 }, // Tier 3: 101-200 kWh
    { limit: 300, rate: 2729 }, // Tier 4: 201-300 kWh
    { limit: 400, rate: 3050 }, // Tier 5: 301-400 kWh
    { limit: Infinity, rate: 3151 }, // Tier 6: >400 kWh
];

/**
 * Calculates the total cost for a given monthly kWh consumption based on tiered pricing.
 * @param monthlyKwh - Estimated or actual monthly consumption in kWh.
 * @returns Total cost in VND for the month.
 */
function calculateTieredCostVnd(monthlyKwh: number): number {
    let totalCost = 0;
    let remainingKwh = monthlyKwh;
    let previousLimit = 0;

    for (const tier of vndTiers) {
        const tierKwh = Math.min(remainingKwh, tier.limit - previousLimit);
        if (tierKwh <= 0) break;

        totalCost += tierKwh * tier.rate;
        remainingKwh -= tierKwh;
        previousLimit = tier.limit;
    }

    return totalCost;
}

/**
 * Estimates the average VND/kWh rate based on total consumption over a period.
 * @param totalKwh - Total kWh consumed during the period.
 * @param periodDays - The duration of the period in days.
 * @returns Estimated average rate in VND/kWh.
 */
function calculateAverageVndRate(totalKwh: number, periodDays: number): number {
    if (periodDays <= 0 || totalKwh <= 0) {
        return vndTiers[0].rate; // Return base rate if no consumption or invalid period
    }

    const averageDailyKwh = totalKwh / periodDays;
    const estimatedMonthlyKwh = averageDailyKwh * 30; // Estimate monthly usage

    const estimatedMonthlyCost = calculateTieredCostVnd(estimatedMonthlyKwh);

    // Return average rate for the estimated monthly consumption
    return estimatedMonthlyKwh > 0 ? estimatedMonthlyCost / estimatedMonthlyKwh : vndTiers[0].rate;
}
// --- End of Pricing Logic ---

/**
 * Retrieves power usage statistics (consumption, wash count, cost) for a specified period.
 *
 * @param {Object} req.query.period - Time period ('day', 'week', 'month', 'year')
 * @param {Object} req.query.date - Optional reference date (ISO format)
 * @returns {PowerUsageStatsResponseDto} Calculated statistics for the period
 *
 * @throws {400} Invalid date format or period
 * @throws {500} Database or server error
 */
const getStats: Handler<PowerUsageStatsResponseDto, { Querystring: PowerUsageStatsQueryDto }> = async (req, res) => {
    try {
        const { period, date: dateStr } = req.query;
        const referenceDate = dateStr ? new Date(dateStr) : new Date();

        // Validate date
        if (isNaN(referenceDate.getTime())) {
            logger.warn(`Invalid date format received for stats: ${dateStr}`);
            return res.status(400).send({ error: 'Invalid date format. Please use ISO 8601 format.' });
        }

        // Calculate date range
        const { start, end } = getPeriodDates(period, referenceDate);

        // Fetch aggregated energy consumption
        const energyData = await prisma.powerUsageData.aggregate({
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
        const energyConsumed = energyData._sum.totalKwh ?? 0;

        // Fetch total completed wash count
        const washCountData = await prisma.order.count({
            where: {
                status: OrderStatus.FINISHED,
                // Ensure finishedAt is within the period
                finishedAt: {
                    gte: start,
                    lte: end,
                },
            },
        });
        const totalWashCount = washCountData;

        // Calculate period duration in days
        const periodMs = end.getTime() - start.getTime();
        const periodDays = Math.max(1, periodMs / (1000 * 60 * 60 * 24)); // Use at least 1 day

        // Calculate average VND rate based on consumption pattern
        const averageRate = calculateAverageVndRate(energyConsumed, periodDays);

        // Calculate total cost using the average rate
        const totalCost = energyConsumed * averageRate;

        const response: PowerUsageStatsResponseDto = {
            energyConsumed: Number(energyConsumed.toFixed(2)),
            totalWashCount: totalWashCount,
            totalCost: Math.round(totalCost), // Return cost as integer VND
            startDate: start.toISOString(),
            endDate: end.toISOString(),
        };

        res.status(200).send(response);
    } catch (error) {
        logger.error(`Error getting power usage stats: ${error}`);
        // Handle potential errors from getPeriodDates if period is invalid
        if (error instanceof TypeError && error.message.includes('Cannot read properties of undefined')) {
            return res.status(400).send({ error: `Invalid period type specified.` });
        }
        res.status(500).send({ error: 'Internal Server Error' });
    }
};

export const powerUsageStatsHandler = {
    getStats,
};
