import { hashSync } from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

const user = {
    username: 'admin@domain.com',
    password: 'secret_password'
};

async function generateSampleData() {
    const hashPassword = hashSync(user.password, SALT_ROUNDS);
    const sampleUser = await prisma.user.create({
        data: {
            username: user.username,
            password: hashPassword
        }
    });
    console.log(sampleUser);
    process.exit(0);
}

generateSampleData();
