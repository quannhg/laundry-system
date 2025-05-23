import { hashSync } from 'bcrypt';
import { LaundryStatus, OrderStatus, PrismaClient, User, WashingMode } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/vi'; // Using faker for potential future use or fallback

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;
const NUMBER_OF_USERS = 100;
const NUMBER_OF_MACHINES = 50;
const TOTAL_ORDERS_TO_SEED = 500;
const MAX_PENDING_ORDERS_PER_USER = 3;
const MAX_WASHING_ORDERS_PER_USER = 2;

// Define washing modes by name instead of enum
const WASHING_MODE_NAMES = {
    NORMAL: 'Giặt thường',
    THOROUGHLY: 'Giặt kỹ',
};

// Target year for data generation
const TARGET_YEAR = 2025;

const KWH_RANGES = {
    [WASHING_MODE_NAMES.NORMAL]: { min: 0.4, max: 0.9 },
    [WASHING_MODE_NAMES.THOROUGHLY]: { min: 0.8, max: 1.8 },
};
const WASH_DURATION_MINUTES = { min: 45, max: 75 }; // Duration of a wash cycle
const DEFAULT_PASSWORD = 'password123';
const ADMIN_PASSWORD = 'secret_password';
const ADMIN_EMAIL = 'admin@domain.com';

const vietnameseNames = [
    'Nguyễn Hồng Quân',
    'Phạm Văn Nhật Vũ',
    'Nguyễn Tuyết Vy',
    'Phạm Quốc Bảo',
    'Hoàng Thị Mai',
    'Vũ Đình Long',
    'Đặng Thu Hà',
    'Bùi Xuân Đức',
    'Đỗ Thị Lan',
    'Ngô Quang Minh',
    'Dương Thị Ngọc',
    'Trịnh Văn Thắng',
    'Lý Thanh Hải',
    'Mai Thị Linh',
    'Hồ Đức Anh',
    'Đinh Văn Trung',
    'Phan Thị Thảo',
    'Võ Quang Huy',
    'Huỳnh Ngọc Ánh',
    'Đoàn Minh Khôi',
    'Lưu Thị Hồng',
    'Trương Công Đạt',
    'Nguyễn Thành Nam',
    'Trần Vĩnh Phúc',
    'Lê Thị Thanh',
    'Phạm Tuấn Kiệt',
    'Hoàng Minh Trí',
    'Vũ Thị Phương',
    'Đặng Quốc Việt',
    'Bùi Thị Huyền',
    'Đỗ Văn Hoàng',
    'Ngô Thị Diệp',
    'Dương Quốc Khánh',
    'Trịnh Thị Xuân',
    'Lý Văn Tùng',
    'Mai Quang Thái',
    'Hồ Thị Kim',
    'Đinh Minh Quân',
    'Phan Văn Hiếu',
    'Võ Thị Thúy',
    'Huỳnh Đức Dũng',
    'Đoàn Thị Ngân',
    'Lưu Quang Tiến',
    'Trương Thị Hà',
    'Nguyễn Đức Thịnh',
    'Trần Thị Quỳnh',
    'Lê Văn Phong',
    'Phạm Thị Trâm',
    'Hoàng Đình Lộc',
    'Vũ Thị Hương',
    'Đặng Minh Khải',
    'Bùi Văn Toàn',
    'Đỗ Thị Mai',
    'Ngô Đình Phúc',
    'Dương Thị Liên',
    'Trịnh Quang Đạt',
    'Lý Thị Thủy',
    'Mai Văn Cường',
    'Hồ Quỳnh Anh',
    'Đinh Thị Trang',
    'Phan Thanh Sơn',
    'Võ Minh Nhật',
    'Huỳnh Thị Mỹ',
    'Đoàn Văn Hải',
    'Lưu Thị Thảo',
    'Trương Minh Tuấn',
    'Nguyễn Thị Phương',
    'Trần Quốc Bình',
    'Lê Thị Ngọc',
    'Phạm Văn Đạt',
    'Hoàng Thị Thu',
    'Vũ Minh Hiếu',
    'Đặng Thị Tuyết',
    'Bùi Quang Linh',
    'Đỗ Văn Thành',
    'Ngô Thị Vân',
    'Dương Văn Tài',
    'Trịnh Thị Hà',
    'Lý Minh Đức',
    'Mai Thị Huyền',
    'Hồ Văn Long',
    'Đinh Thị Thơm',
    'Phan Quốc Tuấn',
    'Võ Thị Lan',
    'Huỳnh Minh Trí',
    'Đoàn Thị Yến',
    'Lưu Văn Phong',
    'Trương Thị Thảo',
    'Nguyễn Minh Hoàng',
    'Trần Thị Phượng',
    'Lê Quang Vinh',
    'Phạm Thị Hà',
    'Hoàng Văn Thắng',
    'Vũ Thị Thúy',
    'Đặng Quốc Hưng',
    'Bùi Thị Thanh',
    'Đỗ Minh Quân',
    'Ngô Thị Hường',
    'Dương Văn Hiếu',
    'Trịnh Thị Giang', // Added trailing comma
];

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

function addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60000);
}

function generateRandomAuthCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateEmailFromName(name: string): string {
    const cleanedName = name
        .toLowerCase()
        // Remove Vietnamese diacritics
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        // Replace đ with d
        .replace(/đ/g, 'd')
        .replace(/\s+/g, '.') // Replace spaces with dots
        .replace(/[^a-z0-9.]/g, ''); // Remove invalid characters
    return `${cleanedName}@example.com`;
}

// New functions for target year date generation
function getRandomDateInYear(year = TARGET_YEAR): Date {
    const start = new Date(year, 0, 1); // January 1st of target year

    // Ensure end date doesn't exceed current date
    const currentDate = new Date();
    const defaultEnd = new Date(year, 11, 31, 23, 59, 59); // December 31st of target year

    // Determine the end date based on the year
    let end: Date;
    if (year < currentDate.getFullYear()) {
        end = defaultEnd; // Past year, use December 31st
    } else if (year === currentDate.getFullYear()) {
        end = currentDate; // Current year, use current date
    } else {
        end = defaultEnd; // Future year (shouldn't happen with our changes)
    }

    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomDateInMonth(year = TARGET_YEAR, month = 0): Date {
    // month is 0-indexed (0 = January, 11 = December)
    const currentDate = new Date();

    // Check if we're generating a date for the current month and year
    const isCurrentMonthAndYear = year === currentDate.getFullYear() && month === currentDate.getMonth();

    // Determine the maximum day based on whether it's the current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const maxDay = isCurrentMonthAndYear ? currentDate.getDate() : daysInMonth;

    const day = Math.floor(Math.random() * maxDay) + 1;

    // For current month and year, also limit hours, minutes, and seconds
    let hours: number, minutes: number, seconds: number;
    if (isCurrentMonthAndYear && day === currentDate.getDate()) {
        hours = Math.floor(Math.random() * (currentDate.getHours() + 1));
        minutes =
            hours === currentDate.getHours() ? Math.floor(Math.random() * (currentDate.getMinutes() + 1)) : Math.floor(Math.random() * 60);
        seconds =
            hours === currentDate.getHours() && minutes === currentDate.getMinutes()
                ? Math.floor(Math.random() * (currentDate.getSeconds() + 1))
                : Math.floor(Math.random() * 60);
    } else {
        hours = Math.floor(Math.random() * 24);
        minutes = Math.floor(Math.random() * 60);
        seconds = Math.floor(Math.random() * 60);
    }

    return new Date(year, month, day, hours, minutes, seconds);
}

// Distribute dates evenly throughout the year
function getDistributedDates(count: number, year = TARGET_YEAR): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Determine the maximum month we can use based on current date
    let maxMonth: number;
    if (year < currentYear) {
        maxMonth = 11; // Past year, use all months
    } else if (year === currentYear) {
        maxMonth = currentMonth; // Current year, use up to current month
    } else {
        maxMonth = 11; // Future year (shouldn't happen with our changes)
    }

    // Ensure at least some orders in each available month
    for (let month = 0; month <= maxMonth; month++) {
        // Add 5-15 orders per month as a baseline
        const ordersPerMonth = Math.floor(Math.random() * 10) + 5;

        for (let i = 0; i < ordersPerMonth; i++) {
            dates.push(getRandomDateInMonth(year, month));
        }
    }

    // Fill the rest randomly throughout the available time period
    while (dates.length < count) {
        dates.push(getRandomDateInYear(year));
    }

    // Sort chronologically
    return dates.sort((a, b) => a.getTime() - b.getTime());
}

// --- Data Generation Functions ---

async function generateWashingModes() {
    // Ensure washing modes exist in the database
    const modes = [
        {
            name: WASHING_MODE_NAMES.NORMAL,
            price: 25000,
            isActive: true,
            duration: 45, // Duration in minutes for normal washing
            capacity: 8, // Capacity in kg for normal washing
        },
        {
            name: WASHING_MODE_NAMES.THOROUGHLY,
            price: 35000,
            isActive: true,
            duration: 70, // Duration in minutes for thorough washing (longer)
            capacity: 8, // Same capacity in kg
        },
    ];

    for (const mode of modes) {
        await prisma.washingMode.upsert({
            where: { name: mode.name },
            update: {},
            create: mode,
        });
    }

    // Get all washing modes for later use
    const washingModes = await prisma.washingMode.findMany();
    console.log(`${washingModes.length} washing modes ensured.`);
    return washingModes;
}

// --- Data Generation Functions ---

async function generateWashingMachines() {
    // Define possible non-broken statuses
    const operationalStatuses = [
        LaundryStatus.IDLE,
        LaundryStatus.IDLE,
        LaundryStatus.IDLE,
        LaundryStatus.IDLE, // Higher chance of IDLE
        LaundryStatus.WASHING,
        LaundryStatus.WASHING,
        LaundryStatus.RINSING,
        LaundryStatus.SPINNING,
        LaundryStatus.WAITING,
    ];

    // Create machines, initially assigning random operational statuses
    const machines = Array.from({ length: NUMBER_OF_MACHINES }, (_, i) => ({
        id: `machine${i + 1}`,
        // Explicitly type status to include BROKEN, even though it's assigned later
        status: getRandomElement(operationalStatuses) as LaundryStatus,
        machineNo: i + 1,
    }));

    // Select one random machine to be BROKEN
    if (NUMBER_OF_MACHINES > 0) {
        const brokenMachineIndex = getRandomInt(0, NUMBER_OF_MACHINES - 1);
        machines[brokenMachineIndex].status = LaundryStatus.BROKEN;
    }

    await prisma.washingMachine.createMany({
        data: machines,
        skipDuplicates: true,
    });
    console.log(`${machines.length} washing machines ensured.`);
    return machines.map((m) => m.id); // Return IDs
}

async function generateUsers() {
    const usersToCreate: Omit<User, 'createdAt' | 'updatedAt'>[] = [];

    // 1. Admin User
    usersToCreate.push({
        id: 'admin_user', // Fixed ID for admin
        name: 'Admin User',
        username: ADMIN_EMAIL,
        password: hashSync(ADMIN_PASSWORD, SALT_ROUNDS),
        email: ADMIN_EMAIL,
        avatarUrl: `https://ui-avatars.com/api/?name=Admin+User`,
        phoneNumber: '0' + faker.string.numeric(9), // Generate a 10-digit phone number starting with 0
        enableNotification: true, // Added missing property
    });

    // 2. Vietnamese Users
    const usedEmails = new Set<string>([ADMIN_EMAIL]);
    for (let i = 0; i < vietnameseNames.length && usersToCreate.length < NUMBER_OF_USERS; i++) {
        const name = vietnameseNames[i];
        let email = generateEmailFromName(name);
        let counter = 1;
        // Ensure email uniqueness
        while (usedEmails.has(email)) {
            email = generateEmailFromName(`${name}${counter++}`);
        }
        usedEmails.add(email);

        usersToCreate.push({
            id: `user_${i + 1}`, // Generate sequential IDs
            name: name,
            username: email, // Use email as username for simplicity
            password: hashSync(DEFAULT_PASSWORD, SALT_ROUNDS),
            email: email,
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
            phoneNumber: '0' + faker.string.numeric(9),
            enableNotification: true, // Added missing property
        });
    }

    // 3. Fill remaining slots if needed (e.g., if name list was short)
    while (usersToCreate.length < NUMBER_OF_USERS) {
        const index = usersToCreate.length;
        const name = `Người Dùng ${index}`; // Placeholder name
        let email = generateEmailFromName(name);
        let counter = 1;
        while (usedEmails.has(email)) {
            email = generateEmailFromName(`${name}${counter++}`);
        }
        usedEmails.add(email);

        usersToCreate.push({
            id: `user_${index}`,
            name: name,
            username: email,
            password: hashSync(DEFAULT_PASSWORD, SALT_ROUNDS),
            email: email,
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
            phoneNumber: '0' + faker.string.numeric(9),
            enableNotification: true, // Added missing property
        });
    }

    await prisma.user.createMany({
        data: usersToCreate,
        skipDuplicates: true,
    });
    console.log(`${usersToCreate.length} users ensured.`);
    return usersToCreate.map((u) => u.id); // Return IDs
}

async function generateOrders(userIds: string[], machineIds: string[], washingModes: WashingMode[]) {
    const allOrdersData = [];
    const paymentMethods = ['Credit Card', 'Cash', 'Mobile Banking'];

    // Reference washing modes by their database IDs
    const normalModeId = washingModes.find((mode) => mode.name === WASHING_MODE_NAMES.NORMAL)?.id;
    const thoroughlyModeId = washingModes.find((mode) => mode.name === WASHING_MODE_NAMES.THOROUGHLY)?.id;

    if (!normalModeId || !thoroughlyModeId) {
        throw new Error('Required washing modes not found in database');
    }

    const washingModeIds = [normalModeId, thoroughlyModeId];

    const possibleStatuses = [
        OrderStatus.FINISHED,
        OrderStatus.FINISHED,
        OrderStatus.FINISHED, // Higher chance of finished/confirmed
        OrderStatus.CONFIRMED,
        OrderStatus.CONFIRMED,
        OrderStatus.CONFIRMED,
        OrderStatus.WASHING,
        OrderStatus.PENDING,
        OrderStatus.CANCELLED,
        OrderStatus.REFUNDED, // Few cancelled/refunded
    ];

    // Keep track of active orders per user
    const userOrderCounts: Record<string, { pending: number; washing: number }> = {};
    userIds.forEach((id) => {
        userOrderCounts[id] = { pending: 0, washing: 0 };
    });

    // Generate distributed dates for 2025
    const distributedDates = getDistributedDates(TOTAL_ORDERS_TO_SEED);

    for (let i = 0; i < TOTAL_ORDERS_TO_SEED; i++) {
        const userId = getRandomElement(userIds);
        const machineId = getRandomElement(machineIds);
        const userCounts = userOrderCounts[userId];

        // Filter possible statuses based on user constraints
        let availableStatuses = [...possibleStatuses];
        if (userCounts.pending >= MAX_PENDING_ORDERS_PER_USER) {
            availableStatuses = availableStatuses.filter((s) => s !== OrderStatus.PENDING);
        }
        if (userCounts.washing >= MAX_WASHING_ORDERS_PER_USER) {
            availableStatuses = availableStatuses.filter((s) => s !== OrderStatus.WASHING);
        }

        // If constraints make it impossible to assign a status (should be rare), default to FINISHED
        if (availableStatuses.length === 0) {
            availableStatuses.push(OrderStatus.FINISHED);
            console.warn(`User ${userId} hit constraints, defaulting order ${i} to FINISHED.`);
        }

        const status = getRandomElement(availableStatuses);
        const washingModeId = getRandomElement(washingModeIds);
        const selectedWashingMode = washingModes.find((mode) => mode.id === washingModeId) || washingModes[0];
        const price = selectedWashingMode.price;

        // Use the distributed date as the creation date
        let createdAt = distributedDates[i];

        // Ensure no order date exceeds current date
        const now = new Date();
        if (createdAt > now) {
            // If the distributed date is in the future, use a random date up to now
            createdAt = new Date(now.getTime() - getRandomInt(0, 30 * 24) * 60 * 60 * 1000); // Random date within last 30 days
        }

        // Special handling for PENDING and WASHING orders near the end of the dataset:
        // If we're in the last 5% of orders and the date is close to the end of the year,
        // consider making some orders active (PENDING/WASHING) for testing current functionality
        const isRecentOrder = i > TOTAL_ORDERS_TO_SEED * 0.95;
        const isEndOfYear = createdAt.getMonth() >= 10; // November or December

        // For orders supposed to be "happening now"
        if (isRecentOrder && isEndOfYear && (status === OrderStatus.PENDING || status === OrderStatus.WASHING)) {
            // Set createdAt to a very recent date instead of 2025
            createdAt = new Date(now.getTime() - getRandomInt(0, 48) * 60 * 60 * 1000); // 0-48 hours ago
        }

        let washingAt: Date | null = null;
        let finishedAt: Date | null = null;
        let cancelledAt: Date | null = null;

        // Calculate timestamps based on status
        // Using the same 'now' variable from above

        if (status === OrderStatus.WASHING || status === OrderStatus.FINISHED || status === OrderStatus.CONFIRMED) {
            washingAt = addMinutes(createdAt, getRandomInt(5, 15)); // Start washing 5-15 mins after creation
            // Ensure washingAt doesn't exceed current date
            if (washingAt > now) {
                washingAt = new Date(now.getTime() - getRandomInt(5, 30) * 60 * 1000); // 5-30 minutes ago
            }
        }

        if (status === OrderStatus.FINISHED || status === OrderStatus.CONFIRMED) {
            if (washingAt) {
                finishedAt = addMinutes(washingAt, getRandomInt(WASH_DURATION_MINUTES.min, WASH_DURATION_MINUTES.max));
            } else {
                // Should have washingAt, but handle defensively
                finishedAt = addMinutes(createdAt, getRandomInt(WASH_DURATION_MINUTES.min + 5, WASH_DURATION_MINUTES.max + 15));
            }

            // Ensure finishedAt doesn't exceed current date
            if (finishedAt && finishedAt > now) {
                finishedAt = new Date(now.getTime() - getRandomInt(1, 10) * 60 * 1000); // 1-10 minutes ago

                // Also adjust washingAt to be before finishedAt if needed
                if (washingAt && washingAt > finishedAt) {
                    washingAt = new Date(
                        finishedAt.getTime() - getRandomInt(WASH_DURATION_MINUTES.min, WASH_DURATION_MINUTES.max) * 60 * 1000,
                    );
                }
            }
        }

        if (status === OrderStatus.CANCELLED || status === OrderStatus.REFUNDED) {
            cancelledAt = addMinutes(createdAt, getRandomInt(1, 60)); // Cancelled/refunded within an hour

            // Ensure cancelledAt doesn't exceed current date
            if (cancelledAt > now) {
                cancelledAt = new Date(now.getTime() - getRandomInt(1, 30) * 60 * 1000); // 1-30 minutes ago
            }
        }

        const order = {
            userId: userId,
            machineId: machineId,
            status: status,
            washingModeId: washingModeId, // Use ID instead of enum
            isSoak: Math.random() > 0.5,
            paymentMethod: getRandomElement(paymentMethods),
            price: price,
            authCode: generateRandomAuthCode(),
            createdAt: createdAt,
            washingAt: washingAt,
            finishedAt: finishedAt,
            cancelledAt: cancelledAt,
        };
        allOrdersData.push(order);

        // Update user counts for constraints
        if (status === OrderStatus.PENDING) {
            userCounts.pending++;
        } else if (status === OrderStatus.WASHING) {
            userCounts.washing++;
        }
    }

    await prisma.order.createMany({
        data: allOrdersData,
        skipDuplicates: true, // Skip if unique constraints violated
    });

    console.log(`${allOrdersData.length} orders created.`);
}

async function generatePowerUsageData() {
    const completedOrders = await prisma.order.findMany({
        where: {
            status: {
                in: [OrderStatus.FINISHED, OrderStatus.CONFIRMED],
            },
            finishedAt: {
                not: null,
            },
            powerUsage: null,
        },
        select: {
            id: true,
            machineId: true,
            washingMode: true, // This will now be a relation
            finishedAt: true,
        },
    });

    if (completedOrders.length === 0) {
        console.log('No new completed orders found to generate power usage data for.');
        return;
    }

    const powerUsageData = completedOrders.map((order) => {
        // Use the name of the washing mode to determine the kWh range
        const modeName = order.washingMode.name;
        const kwhRange = KWH_RANGES[modeName] || KWH_RANGES[WASHING_MODE_NAMES.NORMAL];
        const totalKwh = getRandomFloat(kwhRange.min, kwhRange.max);

        return {
            orderId: order.id,
            machineId: order.machineId,
            totalKwh: totalKwh,
            recordedAt: order.finishedAt || new Date(), // Use the order's finish time or current date as fallback
        };
    });

    await prisma.powerUsageData.createMany({
        data: powerUsageData,
        skipDuplicates: true, // Skip if orderId constraint violated
    });

    console.log(`${powerUsageData.length} power usage records created.`);
}

// --- Main Execution ---

async function main() {
    console.log('Cleaning up existing data...');
    // Delete in order of dependency
    await prisma.powerUsageData.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.fCMToken.deleteMany({}); // Depends on User
    await prisma.user.deleteMany({});
    await prisma.washingMachine.deleteMany({});
    await prisma.washingMode.deleteMany({}); // Depends on WashingMode
    console.log('Cleanup complete.');

    console.log('Starting to seed database with new logic...');
    const washingModes = await generateWashingModes(); // First create washing modes
    const userIds = await generateUsers();
    const machineIds = await generateWashingMachines();
    await generateOrders(userIds, machineIds, washingModes);
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
    });
