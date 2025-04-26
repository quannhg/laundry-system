import { FastifyInstance } from 'fastify';
import { userPlugin } from './user.route';
import { washingMachinePlugin } from './washingMachine.route';
import { orderPlugin } from './order.route';
import { insightRoutes } from './insight.route';
import { powerUsagePlugin } from './powerUsage.route';
import { verifyToken } from '@hooks';

export async function apiPlugin(app: FastifyInstance) {
    // Why use decorator: https://fastify.dev/docs/latest/Reference/Decorators/#decorators
    app.decorateRequest('user', null);
    app.addHook('preHandler', verifyToken);

    app.register(userPlugin, { prefix: '/user' });
    app.register(washingMachinePlugin, { prefix: '/washing-machine' });
    app.register(orderPlugin, { prefix: '/order' });
    app.register(insightRoutes, { prefix: '/insight' });
    app.register(powerUsagePlugin, { prefix: '/power-usage' });
}
