import { FastifyInstance } from 'fastify';
import { washingMachineV2Plugin } from './washing-machine.route';

export async function v2ApiPlugin(app: FastifyInstance): Promise<void> {
    // Register v2 routes
    app.register(washingMachineV2Plugin, { prefix: '/washing-machine' });
}
