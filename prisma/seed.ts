import { hashSync } from 'bcrypt';
import { LaundryStatus, OrderStatus, PrismaClient, WashingMode } from '@prisma/client';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function generateWashingMachines() {
    const washingMachines = [
        {
            id: 'machine1',
            status: LaundryStatus.IDLE,
            machineNo: 1,
        },
        {
            id: 'machine2',
            status: LaundryStatus.WASHING,
            machineNo: 2,
        },
        {
            id: 'machine3',
            status: LaundryStatus.RINSING,
            machineNo: 3,
        },
        {
            id: 'machine4',
            status: LaundryStatus.WASHING,
            machineNo: 4,
        },
        {
            id: 'machine5',
            status: LaundryStatus.IDLE,
            machineNo: 5,
        },
        {
            id: 'machine6',
            status: LaundryStatus.IDLE,
            machineNo: 6,
        },
        {
            id: 'machine7',
            status: LaundryStatus.IDLE,
            machineNo: 7,
        },
        {
            id: 'machine8',
            status: LaundryStatus.IDLE,
            machineNo: 8,
        },
        {
            id: 'machine9',
            status: LaundryStatus.WASHING,
            machineNo: 9,
        },
        {
            id: 'machine10',
            status: LaundryStatus.WASHING,
            machineNo: 10,
        },
        {
            id: 'machine11',
            status: LaundryStatus.RINSING,
            machineNo: 11,
        },
        {
            id: 'machine12',
            status: LaundryStatus.SPINNING,
            machineNo: 12,
        },
    ];

    await prisma.washingMachine.createMany({
        data: washingMachines,
    });
    const statusCounts = washingMachines.reduce(
        (acc, machine) => {
            acc[machine.status] = (acc[machine.status] || 0) + 1;
            return acc;
        },
        {} as Record<LaundryStatus, number>,
    );
    console.log('Washing machines created:', statusCounts);
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
    ];

    for (const user of users) {
    const hashPassword = hashSync(user.password, SALT_ROUNDS);
        await prisma.user.create({
        data: {
                id: user.id,
            username: user.username,
            name: user.name,
            password: hashPassword,
            email: user.email,
            avatarUrl: user.avatarUrl,
            phoneNumber: user.phoneNumber,
        },
    });
    }
    console.log(`${users.length} users created`);
}

async function generateOrders() {
    const paymentMethods = ['Credit Card', 'Cash', 'Mobile Banking'];
    const orderData = [
        {
            userId: 'user1',
            machineId: 'machine1',
            status: OrderStatus.PENDING,
            washingMode: WashingMode.NORMAL,
            isSoak: false,
            paymentMethod: paymentMethods[0],
            price: 25000,
            authCode: '123456',
            createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        },
        {
            userId: 'user1',
            machineId: 'machine5',
            status: OrderStatus.WASHING,
            washingMode: WashingMode.THOROUGHLY,
            isSoak: true,
            paymentMethod: paymentMethods[0],
            price: 35000,
            authCode: '234567',
            createdAt: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
            washingAt: new Date(Date.now() - 1000 * 60 * 90), // 1.5 hours ago
        },
        {
            userId: 'user1',
            machineId: 'machine6',
            status: OrderStatus.FINISHED,
            washingMode: WashingMode.NORMAL,
            isSoak: false,
            paymentMethod: paymentMethods[1],
            price: 25000,
            authCode: '345678',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            washingAt: new Date(Date.now() - 1000 * 60 * 60 * 23), // 23 hours ago
            finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 22), // 22 hours ago
        },
        {
            userId: 'user2',
            machineId: 'machine2',
            status: OrderStatus.WASHING,
            washingMode: WashingMode.THOROUGHLY,
            isSoak: true,
            paymentMethod: paymentMethods[2],
            price: 35000,
            authCode: '456789',
            createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
            washingAt: new Date(Date.now() - 1000 * 60 * 20), // 20 mins ago
        },
        {
            userId: 'user2',
            machineId: 'machine7',
            status: OrderStatus.CONFIRMED,
            washingMode: WashingMode.NORMAL,
            isSoak: false,
            paymentMethod: paymentMethods[0],
            price: 25000,
            authCode: '567890',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
            washingAt: new Date(Date.now() - 1000 * 60 * 60 * 47), // 47 hours ago
            finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 46), // 46 hours ago
        },
        {
            userId: 'user3',
            machineId: 'machine8',
            status: OrderStatus.CANCELLED,
            washingMode: WashingMode.THOROUGHLY,
            isSoak: true,
            paymentMethod: paymentMethods[1],
            price: 35000,
            authCode: '678901',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
            cancelledAt: new Date(Date.now() - 1000 * 60 * 60 * 2.8), // 2.8 hours ago
        },
        {
            userId: 'user3',
            machineId: 'machine9',
            status: OrderStatus.WASHING,
            washingMode: WashingMode.NORMAL,
            isSoak: false,
            paymentMethod: paymentMethods[2],
            price: 25000,
            authCode: '789012',
            createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
            washingAt: new Date(Date.now() - 1000 * 60 * 10), // 10 mins ago
        },
        {
            userId: 'user4',
            machineId: 'machine10',
            status: OrderStatus.WASHING,
            washingMode: WashingMode.THOROUGHLY,
            isSoak: true,
            paymentMethod: paymentMethods[0],
            price: 35000,
            authCode: '890123',
            createdAt: new Date(Date.now() - 1000 * 60 * 25), // 25 mins ago
            washingAt: new Date(Date.now() - 1000 * 60 * 20), // 20 mins ago
        },
        {
            userId: 'user4',
            machineId: 'machine11',
            status: OrderStatus.REFUNDED,
            washingMode: WashingMode.NORMAL,
            isSoak: false,
            paymentMethod: paymentMethods[1],
            price: 25000,
            authCode: '901234',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
            cancelledAt: new Date(Date.now() - 1000 * 60 * 60 * 4.5), // 4.5 hours ago
        },
        {
            userId: 'user5',
            machineId: 'machine12',
            status: OrderStatus.FINISHED,
            washingMode: WashingMode.THOROUGHLY,
            isSoak: true,
            paymentMethod: paymentMethods[2],
            price: 35000,
            authCode: '012345',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
            washingAt: new Date(Date.now() - 1000 * 60 * 60 * 5.8), // 5.8 hours ago
            finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5.3), // 5.3 hours ago
        },
        // Add more orders for the past week
        {
            userId: 'user1',
            machineId: 'machine3',
            status: OrderStatus.CONFIRMED,
            washingMode: WashingMode.NORMAL,
            isSoak: false,
            paymentMethod: paymentMethods[0],
            price: 25000,
            authCode: '123001',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
            washingAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 10), // 3 days - 10 mins ago
            finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 60), // 3 days - 1 hour ago
        },
        {
            userId: 'user2',
            machineId: 'machine4',
            status: OrderStatus.CONFIRMED,
            washingMode: WashingMode.THOROUGHLY,
            isSoak: true,
            paymentMethod: paymentMethods[1],
            price: 35000,
            authCode: '123002',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 days ago
            washingAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4 + 1000 * 60 * 15), // 4 days - 15 mins ago
            finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4 + 1000 * 60 * 60), // 4 days - 1 hour ago
        },
        {
            userId: 'user3',
            machineId: 'machine5',
            status: OrderStatus.CONFIRMED,
            washingMode: WashingMode.NORMAL,
            isSoak: false,
            paymentMethod: paymentMethods[2],
            price: 25000,
            authCode: '123003',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
            washingAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5 + 1000 * 60 * 20), // 5 days - 20 mins ago
            finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5 + 1000 * 60 * 60), // 5 days - 1 hour ago
        },
        {
            userId: 'user4',
            machineId: 'machine6',
            status: OrderStatus.CONFIRMED,
            washingMode: WashingMode.THOROUGHLY,
            isSoak: true,
            paymentMethod: paymentMethods[0],
            price: 35000,
            authCode: '123004',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6), // 6 days ago
            washingAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6 + 1000 * 60 * 25), // 6 days - 25 mins ago
            finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6 + 1000 * 60 * 60), // 6 days - 1 hour ago
        },
        {
            userId: 'user5',
            machineId: 'machine7',
            status: OrderStatus.CONFIRMED,
            washingMode: WashingMode.NORMAL,
            isSoak: false,
            paymentMethod: paymentMethods[1],
            price: 25000,
            authCode: '123005',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
            washingAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 30), // 7 days - 30 mins ago
            finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 60), // 7 days - 1 hour ago
        },
    ];

    for (const order of orderData) {
        await prisma.order.create({
            data: order,
        });
    }

    console.log(`${orderData.length} orders created`);
}

async function generatePowerUsageData() {
    // Fetch orders that are finished or confirmed
    const completedOrders = await prisma.order.findMany({
        where: {
            status: {
                in: [OrderStatus.FINISHED, OrderStatus.CONFIRMED],
            },
        },
    });

    const powerUsageData = completedOrders.map(order => ({
        orderId: order.id,
        machineId: order.machineId,
        totalKwh: order.washingMode === WashingMode.NORMAL
            ? Math.random() * 0.5 + 0.5 // Between 0.5 and 1.0 kWh for normal mode
            : Math.random() * 1.0 + 1.0, // Between 1.0 and 2.0 kWh for thorough mode
        recordedAt: order.finishedAt || new Date(),
    }));

    for (const usage of powerUsageData) {
        await prisma.powerUsageData.create({
            data: usage,
        });
    }

    console.log(`${powerUsageData.length} power usage records created`);
}

async function main() {
    // Clear existing data
    console.log('Cleaning up existing data...');
    await prisma.powerUsageData.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.washingMachine.deleteMany({});
    await prisma.fCMToken.deleteMany({});
    await prisma.user.deleteMany({});
    
    console.log('Starting to seed database...');
    await generateUsers();
    await generateWashingMachines();
    await generateOrders();
    await generatePowerUsageData();
    console.log('Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    process.exit(0);
});
