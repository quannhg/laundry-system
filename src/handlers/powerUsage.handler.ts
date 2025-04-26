import { Handler } from '@interfaces';
import { prisma } from '@repositories';
import { logger } from '@utils';
import { GetPowerUsageInputDto } from '@dtos/in';
import { GetPowerUsageResultDto } from '@dtos/out';

const getPowerUsage: Handler<GetPowerUsageResultDto, { Querystring: GetPowerUsageInputDto }> = async (req, res) => {
    try {
        const { machineId, startDate, endDate } = req.query;

        try {
            const where = {
                ...(machineId && { machineId }),
                ...(startDate &&
                    endDate && {
                        recordedAt: {
                            gte: new Date(startDate),
                            lte: new Date(endDate),
                        },
                    }),
            };

            const powerUsageData = await prisma.powerUsageData.findMany({
                where,
                include: {
                    machine: {
                        select: {
                            machineNo: true,
                        },
                    },
                    order: {
                        select: {
                            id: true,
                            status: true,
                            washingMode: true,
                            isSoak: true,
                            washingAt: true,
                            finishedAt: true,
                        },
                    },
                },
                orderBy: {
                    recordedAt: 'desc',
                },
            });

            const formattedData = powerUsageData.map((data) => ({
                id: data.id,
                machineId: data.machineId,
                machineNo: data.machine.machineNo,
                totalKwh: data.totalKwh,
                recordedAt: data.recordedAt.toISOString(),
                order: {
                    id: data.order.id,
                    status: data.order.status,
                    washingMode: data.order.washingMode,
                    isSoak: data.order.isSoak,
                    washingAt: data.order.washingAt?.toISOString() ?? null,
                    finishedAt: data.order.finishedAt?.toISOString() ?? null,
                },
            }));

            res.status(200).send({ powerUsageData: formattedData });
        } catch (error) {
            if (error instanceof Error && error.message.includes('Invalid DateTime')) {
                res.status(400).send({ error: 'Invalid date format' });
                return;
            }
            throw error;
        }
    } catch (error) {
        logger.error(`Error retrieving power usage data: ${error}`);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};

export const powerUsage = {
    getPowerUsage,
};
