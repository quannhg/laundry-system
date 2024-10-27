import { prisma } from '@repositories';
import { Handler } from '@interfaces';
import { WashingMachineDto } from '@dtos/out';
import { logger } from '@utils';

const fetchWashingMachines: Handler<WashingMachineDto[]> = async (_req, res) => {
    try {
        const washingMachines = await prisma.washingMachine.findMany();
        logger.debug(washingMachines);
        return washingMachines;
    } catch (error) {
        return res.internalServerError(error);
    }
};

export const washingMachineHandler = {
    fetchWashingMachines
};
