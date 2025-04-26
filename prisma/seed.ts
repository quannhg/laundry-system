import { hashSync } from 'bcrypt';
import { LaundryStatus, OrderStatus, PrismaClient, WashingMode } from '@prisma/client';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;
const NUMBER_OF_DAYS_TO_SEED = 365; // Seed data for the past year
const ORDERS_PER_DAY_RANGE = { min: 8, max: 25 }; // Random number of orders per day
const KWH_RANGES = {
    [WashingMode.NORMAL]: { min: 0.4, max: 0.9 },
    [WashingMode.THOROUGHLY]: { min: 0.8, max: 1.8 },
};
const WASH_DURATION_MINUTES = { min: 45, max: 75 }; // Duration of a wash cycle

// --- Helper Functions ---

function getRandomElement<T>(arr: T[]): T {
    if (arr.length === 0) throw new Error('Cannot get random element from empty array');
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min: number, max: number, decimals: number = 2): number {
    const str = (Math.random() * (max - min) + min).toFixed(decimals);
    return parseFloat(str);
}

function getRandomDateInRange(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60000);
}

function generateRandomAuthCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// --- Data Generation Functions ---

async function generateWashingMachines() {
    const machines = Array.from({ length: 12 }, (_, i) => ({
        id: `machine${i + 1}`,
        status: getRandomElement([
            LaundryStatus.IDLE,
            LaundryStatus.IDLE,
            LaundryStatus.IDLE,
            LaundryStatus.IDLE, // Higher chance of IDLE
            LaundryStatus.WASHING,
            LaundryStatus.WASHING,
            LaundryStatus.RINSING,
            LaundryStatus.SPINNING,
            LaundryStatus.WAITING,
            LaundryStatus.BROKEN, // Small chance of BROKEN
        ]),
        machineNo: i + 1,
    }));

    await prisma.washingMachine.createMany({
        data: machines,
        skipDuplicates: true, // Skip if IDs already exist (useful for re-running seed)
    });
    console.log(`${machines.length} washing machines ensured.`);
    return machines.map((m) => m.id); // Return IDs
}

async function generateUsers() {
    const users = [
        {
            id: 'user1',
            name: 'Alex Smith',
            username: 'admin@domain.com',
            password: 'secret_password',
            email: 'admin@domain.com',
            avatarUrl: 'https://lh3.googleusercontent.com/a/ACg8ocIjkHVXfD15PLabkbAx1TlsWTsTf8sT_mXtwckwxcBV4UtMi4j_=s360-c-no',
            phoneNumber: '0123456789',
        },
        {
            id: 'user2',
            name: 'John Doe',
            username: 'john@example.com',
            password: 'password123',
            email: 'john@example.com',
            avatarUrl: 'https://ui-avatars.com/api/?name=John+Doe',
            phoneNumber: '0987654321',
        },
        {
            id: 'user3',
            name: 'Jane Smith',
            username: 'jane@example.com',
            password: 'password123',
            email: 'jane@example.com',
            avatarUrl: 'https://ui-avatars.com/api/?name=Jane+Smith',
            phoneNumber: '0369852147',
        },
        {
            id: 'user4',
            name: 'Nguyen Van A',
            username: 'nguyenvana@example.com',
            password: 'password123',
            email: 'nguyenvana@example.com',
            avatarUrl: 'https://ui-avatars.com/api/?name=Nguyen+Van+A',
            phoneNumber: '0123456987',
        },
        {
            id: 'user5',
            name: 'Tran Thi B',
            username: 'tranthib@example.com',
            password: 'password123',
            email: 'tranthib@example.com',
            avatarUrl: 'https://ui-avatars.com/api/?name=Tran+Thi+B',
            phoneNumber: '0987123456',
        },
        // Add more users if needed
    ];

    const userData = users.map((user) => ({
        ...user,
        password: hashSync(user.password, SALT_ROUNDS),
    }));

    await prisma.user.createMany({
        data: userData,
        skipDuplicates: true, // Skip if IDs/usernames already exist
    });
    console.log(`${users.length} users ensured.`);
    return users.map((u) => u.id); // Return IDs
}

async function generateOrders(userIds: string[], machineIds: string[]) {
    const allOrdersData = [];
    const today = new Date();
    const paymentMethods = ['Credit Card', 'Cash', 'Mobile Banking'];
    const washingModes = [WashingMode.NORMAL, WashingMode.THOROUGHLY];
    const possibleStatuses = [
        OrderStatus.FINISHED,
        OrderStatus.FINISHED,
        OrderStatus.FINISHED, // Higher chance of finished/confirmed
        OrderStatus.CONFIRMED,
        OrderStatus.CONFIRMED,
        OrderStatus.CONFIRMED,
        OrderStatus.WASHING, // Some ongoing
        OrderStatus.PENDING,
        OrderStatus.CANCELLED, // Few cancelled/refunded
        OrderStatus.REFUNDED,
    ];

    for (let i = 0; i < NUMBER_OF_DAYS_TO_SEED; i++) {
        const currentDayStart = new Date(today);
        currentDayStart.setDate(today.getDate() - i);
        currentDayStart.setHours(0, 0, 0, 0);

        const currentDayEnd = new Date(currentDayStart);
        currentDayEnd.setHours(23, 59, 59, 999);

        const numOrdersToday = getRandomInt(ORDERS_PER_DAY_RANGE.min, ORDERS_PER_DAY_RANGE.max);

        for (let j = 0; j < numOrdersToday; j++) {
            let createdAt = getRandomDateInRange(currentDayStart, currentDayEnd); // Changed to let
            const status = getRandomElement(possibleStatuses);
            const washingMode = getRandomElement(washingModes);
            const price = washingMode === WashingMode.NORMAL ? 25000 : 35000;

            let washingAt: Date | null = null;
            let finishedAt: Date | null = null;
            let cancelledAt: Date | null = null;

            if (status !== OrderStatus.PENDING && status !== OrderStatus.CANCELLED && status !== OrderStatus.REFUNDED) {
                washingAt = addMinutes(createdAt, getRandomInt(5, 15)); // Start washing 5-15 mins after creation
            }
            if (status === OrderStatus.FINISHED || status === OrderStatus.CONFIRMED) {
                if (washingAt) {
                    finishedAt = addMinutes(washingAt, getRandomInt(WASH_DURATION_MINUTES.min, WASH_DURATION_MINUTES.max));
                } else {
                    // Should have washingAt, but handle defensively
                    finishedAt = addMinutes(createdAt, getRandomInt(WASH_DURATION_MINUTES.min + 5, WASH_DURATION_MINUTES.max + 15));
                }
            }
            if (status === OrderStatus.CANCELLED || status === OrderStatus.REFUNDED) {
                cancelledAt = addMinutes(createdAt, getRandomInt(1, 60)); // Cancelled/refunded within an hour
            }

            // Ensure future dates are corrected based on status
            if (finishedAt && finishedAt > today && (status === OrderStatus.FINISHED || status === OrderStatus.CONFIRMED)) {
                finishedAt = addMinutes(today, -getRandomInt(1, 30)); // Adjust finish time to be in the past
                if (washingAt && washingAt > finishedAt) {
                    // If washingAt exists and is after adjusted finishedAt
                    washingAt = addMinutes(finishedAt, -getRandomInt(WASH_DURATION_MINUTES.min, WASH_DURATION_MINUTES.max)); // Adjust washingAt based on adjusted finishedAt
                }
                // Adjust createdAt if it's after the potentially adjusted washingAt
                if (washingAt && createdAt > washingAt) {
                    createdAt = addMinutes(washingAt, -getRandomInt(5, 15));
                } else if (!washingAt && createdAt > finishedAt) {
                    // Handle case where washingAt might be null but finishedAt was adjusted
                    createdAt = addMinutes(finishedAt, -getRandomInt(WASH_DURATION_MINUTES.min + 5, WASH_DURATION_MINUTES.max + 15));
                }
            } else if (washingAt && washingAt > today && status === OrderStatus.WASHING) {
                // Ensure washingAt is not in the future if status is WASHING
                washingAt = addMinutes(today, -getRandomInt(1, WASH_DURATION_MINUTES.min - 5)); // Adjust washing start to be in the past
                // Adjust createdAt if it's after the adjusted washingAt
                if (createdAt > washingAt) {
                    createdAt = addMinutes(washingAt, -getRandomInt(5, 15));
                }
            }

            const order = {
                userId: getRandomElement(userIds),
                machineId: getRandomElement(machineIds),
                status: status,
                washingMode: washingMode,
                isSoak: Math.random() > 0.5, // Randomly decide soak
                paymentMethod: getRandomElement(paymentMethods),
                price: price,
                authCode: generateRandomAuthCode(),
                createdAt: createdAt,
                washingAt: washingAt,
                finishedAt: finishedAt,
                cancelledAt: cancelledAt,
            };
            allOrdersData.push(order);
        }
    }

    // Use createMany for bulk insertion
    await prisma.order.createMany({
        data: allOrdersData,
    });

    console.log(`${allOrdersData.length} orders created over ${NUMBER_OF_DAYS_TO_SEED} days.`);
}

async function generatePowerUsageData() {
    // Fetch orders that are finished or confirmed and have a finishedAt date
    const completedOrders = await prisma.order.findMany({
        where: {
            status: {
                in: [OrderStatus.FINISHED, OrderStatus.CONFIRMED],
            },
            finishedAt: {
                not: null, // Ensure finishedAt is set
            },
        },
        select: {
            // Select only necessary fields
            id: true,
            machineId: true,
            washingMode: true,
            finishedAt: true,
        },
    });

    if (completedOrders.length === 0) {
        console.log('No completed orders found to generate power usage data for.');
        return;
    }

    const powerUsageData = completedOrders.map((order) => {
        const kwhRange = KWH_RANGES[order.washingMode];
        const totalKwh = getRandomFloat(kwhRange.min, kwhRange.max);

        return {
            orderId: order.id,
            machineId: order.machineId,
            totalKwh: totalKwh,
            recordedAt: order.finishedAt!, // Use the order's finish time, assert non-null based on query
        };
    });

    // Use createMany for bulk insertion
    await prisma.powerUsageData.createMany({
        data: powerUsageData,
        skipDuplicates: true, // Skip if orderId constraint violated (e.g., re-running seed)
    });

    console.log(`${powerUsageData.length} power usage records created.`);
}

// --- Main Execution ---

async function main() {
    // Clear existing data in specific order due to relations
    console.log('Cleaning up existing data...');
    await prisma.powerUsageData.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.fCMToken.deleteMany({}); // Depends on User
    await prisma.user.deleteMany({});
    await prisma.washingMachine.deleteMany({});
    console.log('Cleanup complete.');

    console.log('Starting to seed database...');
    const userIds = await generateUsers();
    const machineIds = await generateWashingMachines();
    await generateOrders(userIds, machineIds);
    await generatePowerUsageData();
    console.log('Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        // process.exit(0); // Exit commented out to allow terminal reuse in VS Code
    });
