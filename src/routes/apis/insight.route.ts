import { verifyToken } from '../../hooks'; // Corrected path
import { createRoutes } from '../../utils'; // Corrected path
import { getInsightsHandler } from '../../handlers/insight.handler'; // Corrected path
import { InsightResponseDto } from '../../dtos/out'; // Corrected path

export const insightRoutes = createRoutes('Insight', [
    {
        method: 'GET',
        url: '/insights',
        schema: {
            description: 'Fetch AI-generated operational insights for the laundromat.',
            summary: 'Get AI Insights',
            tags: ['Insight'],
            response: {
                200: InsightResponseDto,
            },
            security: [
                {
                    bearerAuth: [],
                },
            ],
        },
        preHandler: [verifyToken],
        handler: getInsightsHandler,
    },
]);
