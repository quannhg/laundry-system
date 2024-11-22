import { WashingMachineDto } from '@dtos/out';
import { washingMachineHandler } from '@handlers';
import { createRoutes } from '@utils';

export const washingMachinePlugin = createRoutes('Washing Machine', [
    {
        method: 'GET',
        url: '',
        schema: {
            response: {
                200: WashingMachineDto,
            },
        },
        handler: washingMachineHandler.fetchWashingMachines,
    },
]);
