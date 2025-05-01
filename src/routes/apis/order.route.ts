import { createRoutes } from '@utils';
import { ordersHandle } from '../../handlers/order.handler';
import { CreateOrderInputDto, SearchOrdersInputDto, UpdateStatusOrderInputDto } from '@dtos/in';
import {
    CreateOrderResultDto,
    GetAllOrderResultDto,
    SearchOrdersResultDto,
    UpdateStatusOrderResultDto,
    GetOrderByIdResultDto,
} from '@dtos/out';

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
        method: 'GET',
        url: '/:id',
        schema: {
            params: {
                id: { type: 'string' },
            },
            response: {
                200: GetOrderByIdResultDto,
            },
            security: [{ bearerAuth: [] }],
        },
        handler: ordersHandle.getById,
    },
    {
        method: 'GET',
        url: '/search',
        schema: {
            querystring: SearchOrdersInputDto,
            response: {
                200: SearchOrdersResultDto,
            },
            security: [{ bearerAuth: [] }],
        },
        handler: ordersHandle.searchOrders,
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
    {
        method: 'DELETE',
        url: '/:id',
        schema: {
            params: { id: { type: 'string' } },
            response: {
                200: { success: { type: 'boolean' } },
            },
            security: [{ bearerAuth: [] }],
        },
        handler: ordersHandle.remove,
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
        handler: ordersHandle.removeAll,
    },
]);
