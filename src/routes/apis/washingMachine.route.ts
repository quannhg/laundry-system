import { WashingMachineDto } from '@dtos/out';
import { washingMachineHandler } from '@handlers';
import { createRoutes } from '@utils';
import { Type } from '@sinclair/typebox';

export const washingMachinePlugin = createRoutes('Washing Machine', [
    {
        method: 'GET',
        url: '',
        schema: {
            response: {
                200: Type.Array(WashingMachineDto)
            }
        },
        handler: washingMachineHandler.fetchWashingMachines
    }
]);
