import { Handler } from '@interfaces';
import { prisma } from '@repositories';
import { logger } from '@utils';
import { PowerUsageChartQueryDto } from '@dtos/in';
import { PowerUsageChartResponseDto } from '@dtos/out';

/**
 * Power Usage Chart Handler
 * Handles requests for power consumption time series data.
 *
 * @module PowerUsageChart
 */

/**
 * Retrieves power consumption data aggregated by time intervals.
 * The data is formatted for use in charts and visualizations.
 *
 * @param {Object} req.query.period - Time period for aggregation ('day', 'week', 'month', 'year')
 * @param {Object} req.query.startDate - Optional start date (ISO format)
 * @returns {PowerUsageChartResponseDto} Aggregated power usage data with metadata
 *
 * @throws {400} Invalid date format
 * @throws {500} Database or server error
 */
import { getPeriodDates, getIntervalForPeriod, getExpectedDataPoints } from '../utils/powerUsageChart';
import { Prisma } from '@prisma/client';

const getChart: Handler<PowerUsageChartResponseDto, { Querystring: PowerUsageChartQueryDto }> = async (req, res) => {
    try {
        const { period, startDate: startDateStr } = req.query;
        const startDate = startDateStr ? new Date(startDateStr) : undefined;

        // Get date range and interval
        const { start, end } = getPeriodDates(period, startDate);
        const interval = getIntervalForPeriod(period);

        // Query power usage data
        const powerUsageData = await prisma.$queryRaw<
            Array<{
                timestamp: Date;
                consumption: number;
                machineCount: number;
            }>
        >(
            Prisma.sql`
            SELECT 
                date_trunc(${interval}, "recordedAt") as timestamp,
                SUM("totalKwh") as consumption,
                COUNT(DISTINCT "machineId") as "machineCount"
            FROM "PowerUsageData"
            WHERE "recordedAt" BETWEEN ${start} AND ${end}
            GROUP BY timestamp
            ORDER BY timestamp ASC
            `,
        );

        // Calculate power cost (example rate: $0.12 per kWh)
        const POWER_RATE = 0.12;
        const formattedData = powerUsageData.map((data) => ({
            timestamp: data.timestamp.toISOString(),
            consumption: Number(data.consumption.toFixed(2)),
            machineCount: data.machineCount,
            cost: Number((data.consumption * POWER_RATE).toFixed(2)),
        }));

        const response = {
            data: formattedData,
            metadata: {
                period,
                interval,
                startDate: start.toISOString(),
                endDate: end.toISOString(),
                totalPoints: getExpectedDataPoints(period),
            },
        };

        res.status(200).send(response);
    } catch (error) {
        logger.error(`Error getting power usage chart data: ${error}`);
        if (error instanceof Error && error.message.includes('Invalid DateTime')) {
            res.status(400).send({ error: 'Invalid date format' });
            return;
        }
        res.status(500).send({ error: 'Internal Server Error' });
    }
};

export const powerUsageChart = {
    getChart,
};
