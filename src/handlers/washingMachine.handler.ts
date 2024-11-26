import { prisma } from '@repositories';
import { Handler } from '@interfaces';
import { WashingMachineDto } from '@dtos/out';

const fetchWashingMachines: Handler<WashingMachineDto> = async (_req, res) => {
    try {
        const washingMachines = await prisma.washingMachine.groupBy({
            by: ['status'],
            _count: {
                status: true,
            },
        });

        const result: WashingMachineDto = {
            idle: washingMachines.find((machine) => machine.status === 'IDLE')?._count.status || 0,
            washing: washingMachines.find((machine) => machine.status === 'WASHING')?._count.status || 0,
            dry: washingMachines.find((machine) => machine.status === 'DRYING')?._count.status || 0,
        };

        return res.send(result);
    } catch (error) {
        return res.internalServerError(error);
    }
};

export const washingMachineHandler = {
    fetchWashingMachines,
};
