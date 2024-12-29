import { CreatingWashingMachineResultDto, WashingMachineDto } from '@dtos/out';
import { washingMachineHandler } from '@handlers';
import { createRoutes } from '@utils';
import { CreatingWashingMachineInputDto } from '@dtos/in';

export const washingMachinePlugin = createRoutes('Washing Machine', [
    {
        method: 'GET',
        url: '',
        schema: {
            response: {
                200: WashingMachineDto,
            },
            security: [{ bearerAuth: [] }],
        },
        handler: washingMachineHandler.fetchWashingMachines,
    },
    {
        method: 'POST',
        url: '',
        schema: {
            body: CreatingWashingMachineInputDto,
            response: {
                200: CreatingWashingMachineResultDto,
            },
            security: [{ bearerAuth: [] }],
        },
        handler: washingMachineHandler.addWashingMachine,
    },
    {
        method: 'DELETE',
        url: '',
        schema: {
            response: {
                200: { success: { type: 'boolean' } },
            },
            security: [{ bearerAuth: [] }],
        },
        handler: washingMachineHandler.removeAllWashingMachines,
    },
]);
