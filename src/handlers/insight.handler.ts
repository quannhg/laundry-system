import { FastifyReply, FastifyRequest } from 'fastify';
import { logger } from '../utils';
import axios from 'axios';
import { envs } from '../configs';
import { subWeeks, startOfWeek } from 'date-fns';
// Import correct models and enums from Prisma
import { Order, WashingMachine, PowerUsageData, OrderStatus, LaundryStatus, WashingMode } from '@prisma/client';
import { prisma } from '../repositories'; // Import Prisma client

// Define more specific types for Latitude input
interface LatitudePowerUsageInput {
    totalKwh: number;
    recordedAt: Date;
}

interface LatitudeOrderInput {
    id: string;
    createdAt: Date;
    status: OrderStatus;
    price: number | null;
    machineId: string;
    washingMode: WashingMode;
    isSoak: boolean | null;
    powerUsage: LatitudePowerUsageInput | null; // Added power usage
}

interface LatitudeMachineInput {
    id: string;
    status: LaundryStatus;
    machineNo: number;
}

interface LatitudeInput {
    orders: LatitudeOrderInput[];
    machines: LatitudeMachineInput[];
}

// Removed mock data generation functions (lines 38-106)

export const getInsightsHandler = async (_request: FastifyRequest, reply: FastifyReply) => {
    // Define the type for orders fetched with powerUsage included
    type OrderWithPowerUsage = Order & {
        powerUsage: PowerUsageData | null;
        washingMode: WashingMode;
    };

    try {
        logger.info('Starting insight generation process using REAL DATA');

        // 1. Fetch Data
        const now = new Date();
        const eightWeeksAgo = startOfWeek(subWeeks(now, 7), { weekStartsOn: 1 });
        // Fetch real data using Prisma client
        const machines: WashingMachine[] = await prisma.washingMachine.findMany();
        const orders: OrderWithPowerUsage[] = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: eightWeeksAgo,
                },
            },
            include: {
                powerUsage: true, // Include related power usage data
                washingMode: true, // Include washing mode data
            },
        });

        logger.info(`Fetched ${orders.length} orders and ${machines.length} machines from database`);

        // 2. Format Data for Latitude
        const latitudeInput: LatitudeInput = {
            orders: orders.map(
                (order: OrderWithPowerUsage): LatitudeOrderInput => ({
                    // Explicitly type 'order'
                    id: order.id,
                    createdAt: order.createdAt,
                    status: order.status,
                    price: order.price, // Already a number or null
                    machineId: order.machineId,
                    washingMode: order.washingMode,
                    isSoak: order.isSoak,
                    // Format power usage data if it exists
                    powerUsage: order.powerUsage
                        ? {
                              totalKwh: order.powerUsage.totalKwh, // Already a number
                              recordedAt: order.powerUsage.recordedAt,
                          }
                        : null,
                }),
            ),
            machines: machines.map(
                (machine: WashingMachine): LatitudeMachineInput => ({
                    // Explicitly type 'machine'
                    id: machine.id,
                    status: machine.status,
                    machineNo: machine.machineNo,
                }),
            ),
        };

        // // Output latitudeInput to json file for testing
        // try {
        //     // Create test-data directory if it doesn't exist
        //     const testDataDir = './test-data';
        //     if (!fs.existsSync(testDataDir)) {
        //         fs.mkdirSync(testDataDir, { recursive: true });
        //     }

        //     // Write data with timestamp for better tracking
        //     const timestamp = new Date().toISOString().replace(/:/g, '-');
        //     fs.writeFileSync(
        //         `${testDataDir}/latitude-input-${timestamp}.json`,
        //         JSON.stringify(latitudeInput, null, 2),
        //     );
        //     logger.info(`Test data written to ${testDataDir}/latitude-input-${timestamp}.json`);
        // } catch (error) {
        //     logger.error(`Failed to write test data: ${error}`);
        //     // Continue with the process even if writing test data fails
        // }

        // 3. Get Latitude Credentials
        const apiKey = envs.LATITUDE_API_KEY;
        const projectId = envs.LATITUDE_PROJECT_ID;

        if (!apiKey || !projectId) {
            logger.error('Latitude API Key or Project ID is missing from environment variables');
            return reply.status(500).send({ error: 'Internal configuration error.' });
        }

        // 4. Call Latitude API
        const latitudeApiUrl = `https://gateway.latitude.so/api/v3/projects/${projectId}/versions/live/documents/run`;
        const latitudePayload = {
            path: 'laundromat_insight',
            stream: false,
            parameters: {
                input: JSON.stringify(latitudeInput),
            },
        };

        logger.info('Calling Latitude API...');
        const latitudeResponse = await axios.post(latitudeApiUrl, latitudePayload, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });

        // 5. Parse Latitude Response
        if (latitudeResponse.status !== 200 || !latitudeResponse.data?.response?.text) {
            logger.error(`Received invalid response from Latitude API`);
            logger.error(latitudeResponse.data);
            return reply.status(502).send({ error: 'Failed to get insights from AI service.' });
        }
        // Extract the text content and remove surrounding code block markers if they exist
        const rawResponse = latitudeResponse.data.response.text;
        const rawInsights: string = rawResponse.replace(/^```[\s\S]*?\n/, '').replace(/\n```$/, '');

        const insights = rawInsights.split('\n').filter((line) => line.trim() !== '');

        logger.info(`Successfully generated ${insights.length} insights`);

        // 6. Return Formatted Response
        return reply.send({ insights });
    } catch (error) {
        logger.error(`Error generating insights: ${error}`);
        if (axios.isAxiosError(error)) {
            logger.error(`Axios error details: ${error.response?.data ? JSON.stringify(error.response.data) : 'No response data'}`);
            return reply.status(error.response?.status ?? 502).send({ error: 'Failed to communicate with AI service.' });
        }
        return reply.status(500).send({ error: 'An unexpected error occurred while generating insights.' });
    }
};
