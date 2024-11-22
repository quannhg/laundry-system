import { createRoutes } from '@utils';
import { ordersHandle } from '../../handlers/order.handler';
import { CreateOrderInputDto } from '@dtos/in';
import { CreateOrderResultDto } from '@dtos/out';

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
]);
