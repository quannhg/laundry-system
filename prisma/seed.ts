import { hashSync } from 'bcrypt';
import { LaundryStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function generateWashingMachines() {
    const washingMachines = [
        {
            id: 'machine1',
            status: LaundryStatus.IDLE,
        },
        {
            id: 'machine2',
            status: LaundryStatus.WASHING,
        },
        {
            id: 'machine3',
            status: LaundryStatus.DRYING,
        },
        {
            id: 'machine4',
            status: LaundryStatus.WASHING,
        },
        {
            id: 'machine5',
            status: LaundryStatus.IDLE,
        },
        {
            id: 'machine6',
            status: LaundryStatus.IDLE,
        },
        {
            id: 'machine7',
            status: LaundryStatus.IDLE,
        },
        {
            id: 'machine8',
            status: LaundryStatus.IDLE,
        },
        {
            id: 'machine9',
            status: LaundryStatus.WASHING,
        },
        {
            id: 'machine10',
            status: LaundryStatus.WASHING,
        },
        {
            id: 'machine11',
            status: LaundryStatus.DRYING,
        },
        {
            id: 'machine12',
            status: LaundryStatus.DRYING,
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
    const user = {
        name: 'Alex',
        username: 'admin@domain.com',
        password: 'secret_password',
        email: 'admin@domain.com',
        avatarUrl: 'https://lh3.googleusercontent.com/a/ACg8ocIjkHVXfD15PLabkbAx1TlsWTsTf8sT_mXtwckwxcBV4UtMi4j_=s360-c-no',
        phoneNumber: '0123456789',
    };

    const hashPassword = hashSync(user.password, SALT_ROUNDS);
    const sampleUser = await prisma.user.create({
        data: {
            username: user.username,
            name: user.name,
            password: hashPassword,
            email: user.email,
            avatarUrl: user.avatarUrl,
            phoneNumber: user.phoneNumber,
        },
    });
    console.log('User created:', sampleUser);
}

Promise.all([generateUsers(), generateWashingMachines()]).then(() => {
    process.exit(0);
});
