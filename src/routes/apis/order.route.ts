import { createRoutes } from '@utils';
import { ordersHandle } from '../../handlers/order.handler';
import { CreateOrderInputDto, GetAllOrderInputDto, UpdateStatusOrderInputDto } from '@dtos/in';
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
        },
        handler: ordersHandle.create,
    },
    {
        method: 'GET',
        url: '',
        schema: {
            querystring: GetAllOrderInputDto,
            response: {
                200: GetAllOrderResultDto,
            },
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
        },
        handler: ordersHandle.updateStatus,
    },
]);
