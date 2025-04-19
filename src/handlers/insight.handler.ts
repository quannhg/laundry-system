import { FastifyReply, FastifyRequest } from 'fastify';
import { logger } from '../utils';
import axios from 'axios';
import { envs } from '../configs';
import { subWeeks, startOfWeek } from 'date-fns';
// Import correct models and enums from Prisma
import { Order, WashingMachine, PowerUsageData, OrderStatus, LaundryStatus, WashingMode } from '@prisma/client';

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

// --- Mock Data --- START
// Use Prisma types directly where possible, adjust for differences like price type
interface MockPowerUsageData extends Omit<PowerUsageData, 'order' | 'machine'> {}

interface MockOrder extends Omit<Order, 'price' | 'user' | 'machine' | 'powerUsage'> {
    price: number | null;
    powerUsage: MockPowerUsageData | null; // Added mock power usage
}

interface MockMachine extends WashingMachine {}

const generateMockPowerUsageData = (orderId: string, machineId: string, recordedAt: Date): MockPowerUsageData => ({
    id: `power-${orderId}`,
    orderId: orderId,
    machineId: machineId,
    totalKwh: parseFloat((Math.random() * 1.5).toFixed(2)), // Mock kWh between 0 and 1.5
    recordedAt: recordedAt,
});

const generateMockOrders = (count: number, startDate: Date): MockOrder[] => {
    const orders: MockOrder[] = [];
    const machineIds = ['machine-1', 'machine-2', 'machine-3'];
    const statuses = Object.values(OrderStatus);
    const modes = Object.values(WashingMode);
    let currentDate = new Date(startDate);

    for (let i = 0; i < count; i++) {
        currentDate.setHours(currentDate.getHours() + Math.random() * 5);
        if (currentDate > new Date()) currentDate = new Date(startDate);

        const orderId = `order-${i}`;
        const machineId = machineIds[i % machineIds.length];
        const hasPowerData = i % 2 === 0 && statuses[i % statuses.length] === OrderStatus.FINISHED; // Only add power data for some finished orders

        orders.push({
            id: orderId,
            userId: `user-${i % 10}`,
            machineId: machineId,
            status: statuses[i % statuses.length],
            washingMode: modes[i % modes.length],
            isSoak: i % 3 === 0 ? true : null,
            paymentMethod: i % 2 === 0 ? 'CASH' : 'WALLET',
            price: i % 5 === 0 ? null : Math.floor(Math.random() * 10) + 1,
            authCode: i % 10 === 0 ? `AUTH${i}` : null,
            createdAt: new Date(currentDate),
            updatedAt: new Date(currentDate),
            washingAt: i % 2 === 0 ? new Date(currentDate) : null,
            finishedAt: i % 4 === 0 ? new Date(currentDate) : null,
            cancelledAt: i % 10 === 0 ? new Date(currentDate) : null,
            powerUsage: hasPowerData ? generateMockPowerUsageData(orderId, machineId, new Date(currentDate)) : null,
        });
    }
    return orders;
};

const generateMockMachines = (count: number): MockMachine[] => {
    const machines: MockMachine[] = [];
    const statuses = Object.values(LaundryStatus); // Use correct enum
    for (let i = 0; i < count; i++) {
        machines.push({
            id: `machine-${i + 1}`,
            status: statuses[i % statuses.length],
            machineNo: i + 1, // Added based on schema
            // Add other fields if needed, ensure they match WashingMachine model
        });
    }
    return machines;
};
// --- Mock Data --- END

export const getInsightsHandler = async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
        logger.info('Starting insight generation process using MOCK DATA (schema corrected + power usage)');

        // 1. Fetch Data (Mocked)
        const now = new Date();
        const eightWeeksAgo = startOfWeek(subWeeks(now, 7), { weekStartsOn: 1 });

        // Use mock data instead of Prisma calls
        const machines = generateMockMachines(3);
        const orders = generateMockOrders(100, eightWeeksAgo);

        logger.info(`Using ${orders.length} mock orders and ${machines.length} mock machines`);

        // 2. Format Data for Latitude
        const latitudeInput: LatitudeInput = {
            orders: orders.map(
                (order): LatitudeOrderInput => ({
                    id: order.id,
                    createdAt: order.createdAt,
                    status: order.status,
                    price: order.price, // Use the potentially null price
                    machineId: order.machineId, // Correct field name
                    washingMode: order.washingMode,
                    isSoak: order.isSoak,
                    // Format power usage data if it exists
                    powerUsage: order.powerUsage
                        ? {
                              totalKwh: order.powerUsage.totalKwh,
                              recordedAt: order.powerUsage.recordedAt,
                          }
                        : null,
                }),
            ),
            machines: machines.map(
                (machine): LatitudeMachineInput => ({
                    id: machine.id,
                    status: machine.status,
                    machineNo: machine.machineNo, // Added field
                }),
            ),
        };

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
