import { createRoutes } from '@utils';
import { powerUsage, powerUsageChart, powerUsageSummaryHandler, powerUsageStatsHandler } from '@handlers'; // Add powerUsageStatsHandler
import { GetPowerUsageInputDto, PowerUsageChartQueryDto, PowerUsageSummaryQueryDto, PowerUsageStatsQueryDto } from '@dtos/in'; // Add PowerUsageStatsQueryDto
import { GetPowerUsageResultDto, PowerUsageChartResponseDto, PowerUsageSummaryResponseDto, PowerUsageStatsResponseDto } from '@dtos/out'; // Add PowerUsageStatsResponseDto

export const powerUsagePlugin = createRoutes('PowerUsage', [
    {
        method: 'GET',
        url: '',
        schema: {
            querystring: GetPowerUsageInputDto,
            response: {
                200: GetPowerUsageResultDto,
            },
            security: [{ bearerAuth: [] }],
        },
        handler: powerUsage.getPowerUsage,
    },
    {
        method: 'GET',
        url: '/chart',
        schema: {
            description:
                'Returns aggregated power consumption data in time series format for visualization. Data points frequency varies by period (hourly for day, daily for week/month, monthly for year).',
            querystring: PowerUsageChartQueryDto,
            response: {
                200: PowerUsageChartResponseDto,
            },
            security: [{ bearerAuth: [] }],
        },
        handler: powerUsageChart.getChart,
    },
    {
        method: 'GET',
        url: '/summary',
        schema: {
            summary: 'Get Power Usage Summary',
            description:
                'Retrieves aggregated power usage summaries for day, week, month, and year, comparing current period totals with the previous period.',
            querystring: PowerUsageSummaryQueryDto,
            response: {
                200: PowerUsageSummaryResponseDto,
            },
            security: [
                {
                    bearerAuth: [],
                },
            ],
        },
        handler: powerUsageSummaryHandler.getSummary,
    },
    {
        // Add new stats endpoint
        method: 'GET',
        url: '/stats',
        schema: {
            summary: 'Get Power Usage Statistics',
            description:
                'Retrieves key power usage statistics (consumption, wash count, cost) for a specified period based on an optional reference date.',
            querystring: PowerUsageStatsQueryDto,
            response: {
                200: PowerUsageStatsResponseDto,
            },
            security: [{ bearerAuth: [] }],
        },
        handler: powerUsageStatsHandler.getStats,
    },
]);
