import { createRoutes } from '@utils';
import { powerUsage } from '@handlers';
import { GetPowerUsageInputDto } from '@dtos/in';
import { GetPowerUsageResultDto } from '@dtos/out';

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
]);
