import { Handler } from '@interfaces';
import { prisma } from '@repositories';
import { logger } from '@utils';
import { MachineListItemV2Dto, MachineDetailsV2Dto, MachineStatisticsV2Dto } from '@dtos/v2';

const listMachines: Handler<MachineListItemV2Dto> = async (_req, res) => {
    try {
        // Temporary placeholder implementation
        const machines = await prisma.washingMachine.findMany({
            select: {
                id: true,
                machineNo: true,
                status: true,
            },
            orderBy: {
                machineNo: 'asc',
            },
        });

        logger.debug(`Machines found: ${JSON.stringify(machines)}`);

        res.send(machines);
    } catch (error) {
        logger.error(`Error listing machines: ${error}`);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};

const getMachineDetails: Handler<MachineDetailsV2Dto, { Params: { id: string } }> = async (req, res) => {
    try {
        // Temporary placeholder implementation
        const machine = await prisma.washingMachine.findUnique({
            where: { id: req.params.id },
            select: {
                id: true,
                machineNo: true,
                status: true,
            },
        });

        if (!machine) {
            return res.status(404).send({ error: 'Machine not found' });
        }

        res.send(machine);
    } catch (error) {
        logger.error(`Error getting machine details: ${error}`);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};

const getMachineStatistics: Handler<MachineStatisticsV2Dto, { Params: { id: string } }> = async (req, res) => {
    try {
        // Temporary placeholder implementation
        const machine = await prisma.washingMachine.findUnique({
            where: { id: req.params.id },
            include: {
                _count: {
                    select: {
                        orders: true,
                    },
                },
                powerUsageData: {
                    select: {
                        totalKwh: true,
                    },
                },
            },
        });

        if (!machine) {
            return res.status(404).send({ error: 'Machine not found' });
        }

        const totalPowerUsage = machine.powerUsageData.reduce((sum, record) => sum + record.totalKwh, 0);

        res.send({
            totalOrders: machine._count.orders,
            totalPowerUsage,
        });
    } catch (error) {
        logger.error(`Error getting machine statistics: ${error}`);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};

export const washingMachineV2Handler = {
    listMachines,
    getMachineDetails,
    getMachineStatistics,
};
