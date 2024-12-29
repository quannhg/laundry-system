import { prisma } from '@repositories';
import { Handler } from '@interfaces';
import { CreatingWashingMachineResultDto, WashingMachineDto } from '@dtos/out';
import { LaundryStatus } from '@prisma/client';
import { CreatingWashingMachineInputDto } from '@dtos/in';

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
            washing: washingMachines.find((machine) => machine.status === 'WASHING' || machine.status === 'WAITING')?._count.status || 0,
            dry: washingMachines.find((machine) => machine.status === 'RINSING' || machine.status === 'SPINNING')?._count.status || 0,
        };

        return res.send(result);
    } catch (error) {
        return res.internalServerError(error);
    }
};

const addWashingMachine: Handler<
    CreatingWashingMachineResultDto,
    {
        Body: CreatingWashingMachineInputDto;
    }
> = async (req, res) => {
    try {
        const { machineNo } = req.body;
        const newMachine = await prisma.washingMachine.create({
            data: { machineNo, status: LaundryStatus.IDLE },
        });
        return res.send(newMachine);
    } catch (error) {
        return res.internalServerError(error);
    }
};

const removeAllWashingMachines: Handler<{ success: boolean }> = async (_req, res) => {
    try {
        await prisma.washingMachine.deleteMany({});
        return res.send();
    } catch (error) {
        return res.internalServerError(error);
    }
};

export const washingMachineHandler = {
    fetchWashingMachines,
    addWashingMachine,
    removeAllWashingMachines,
};
