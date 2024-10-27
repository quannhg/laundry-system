import { verifyToken } from 'src/hooks';
import { FastifyInstance } from 'fastify';
import { userPlugin } from './user.route';
import { washingMachinePlugin } from './washingMachine.route';

export async function apiPlugin(app: FastifyInstance) {
    // Why use decorator: https://fastify.dev/docs/latest/Reference/Decorators/#decorators
    app.decorateRequest('user', null);
    app.addHook('preHandler', verifyToken);

    app.register(userPlugin, { prefix: '/user' });
    app.register(washingMachinePlugin, { prefix: '/washing-machine' });
}
