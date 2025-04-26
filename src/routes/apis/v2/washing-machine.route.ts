import { createRoutes } from '@utils';
import { MachineListItemV2Dto, MachineDetailsV2Dto, MachineStatisticsV2Dto } from '@dtos/v2';
import { washingMachineV2Handler } from '@handlers/v2';

export const washingMachineV2Plugin = createRoutes('Washing Machine V2', [
    // List Machines endpoint
    {
        method: 'GET',
        url: '/list',
        schema: {
            response: {
                200: MachineListItemV2Dto,
            },
            security: [{ bearerAuth: [] }],
        },
        handler: washingMachineV2Handler.listMachines,
    },
    // Details endpoint
    {
        method: 'GET',
        url: '/:id/details',
        schema: {
            params: {
                id: { type: 'string' },
            },
            response: {
                200: MachineDetailsV2Dto,
            },
            security: [{ bearerAuth: [] }],
        },
        handler: washingMachineV2Handler.getMachineDetails,
    },
    // Statistics endpoint
    {
        method: 'GET',
        url: '/:id/statistics',
        schema: {
            params: {
                id: { type: 'string' },
            },
            response: {
                200: MachineStatisticsV2Dto,
            },
            security: [{ bearerAuth: [] }],
        },
        handler: washingMachineV2Handler.getMachineStatistics,
    },
]);
