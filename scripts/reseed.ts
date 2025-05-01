import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

async function reseedDatabase() {
    console.log('Starting database reseeding process...');

    try {
        // Get the root directory of the project
        const rootDir = path.resolve(__dirname, '..');

        // Change to the project directory (important for running prisma commands)
        process.chdir(rootDir);

        console.log('Resetting database...');
        await execAsync('npx prisma migrate reset --force');

        console.log('Seeding database with fresh data...');
        await execAsync('npx prisma db seed');

        console.log('Database reseeding completed successfully!');
    } catch (error) {
        console.error('Error during database reseeding:', error);
        process.exit(1);
    }
}

// Execute the function if this script is run directly
if (require.main === module) {
    reseedDatabase();
}

export default reseedDatabase;
