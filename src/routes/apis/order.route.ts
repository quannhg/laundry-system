import { createRoutes } from '@utils';
import { ordersHandle } from '../../handlers/order.handler';
import { CreateOrderInputDto, UpdateStatusOrderInputDto } from '@dtos/in';
import { CreateOrderResultDto, GetAllOrderResultDto, UpdateStatusOrderResultDto } from '@dtos/out';

export const orderPlugin = createRoutes('Order', [
    {
        method: 'POST',
        url: '',
        schema: {
            body: CreateOrderInputDto,
            response: {
                200: CreateOrderResultDto,
            },
            security: [{ bearerAuth: [] }],
        },
        handler: ordersHandle.create,
    },
    {
        method: 'GET',
        url: '',
        schema: {
            response: {
                200: GetAllOrderResultDto,
            },
            security: [{ bearerAuth: [] }],
        },
        handler: ordersHandle.getAll,
    },
    {
        method: 'PUT',
        url: '/status',
        schema: {
            body: UpdateStatusOrderInputDto,
            response: {
                200: UpdateStatusOrderResultDto,
            },
            security: [{ bearerAuth: [] }],
        },
        handler: ordersHandle.updateStatus,
    },
]);
