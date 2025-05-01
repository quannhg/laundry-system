// Script to reset the failed migration
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

async function main() {
  try {
    console.log('Marking the failed migration as applied...');
    const { stdout, stderr } = await execPromise('npx prisma migrate resolve --applied "20250426065659_add_washing_mode_table"');
    
    if (stderr) {
      console.error('Error:', stderr);
    }
    
    console.log('Output:', stdout);
    console.log('Migration marked as applied. Now running the fix script...');
    
    // Run the fix script
    const { stdout: fixStdout, stderr: fixStderr } = await execPromise('npx ts-node prisma/migrations/fix_washing_mode.ts');
    
    if (fixStderr) {
      console.error('Error in fix script:', fixStderr);
    }
    
    console.log('Fix script output:', fixStdout);
    console.log('Migration fix process completed!');
  } catch (error) {
    console.error('Error during migration reset:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  }); 