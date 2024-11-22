import { FastifyInstance } from 'fastify';
import { userPlugin } from './user.route';
import { washingMachinePlugin } from './washingMachine.route';
import { orderPlugin } from './order.route';

export async function apiPlugin(app: FastifyInstance) {
    // Why use decorator: https://fastify.dev/docs/latest/Reference/Decorators/#decorators
    app.decorateRequest('user', null);
    // TODO: update logic verifyToken
    // app.addHook('preHandler', verifyToken);

    app.register(userPlugin, { prefix: '/user' });
    app.register(washingMachinePlugin, { prefix: '/washing-machine' });
    app.register(orderPlugin, { prefix: '/order' });
}
