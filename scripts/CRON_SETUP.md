# Setting Up a Cron Job for Daily Database Reseeding

This document explains how to set up a cron job to automatically reseed your database every day.

## Prerequisites

- Linux/Unix-based system with crontab
- Node.js and yarn installed
- The application is properly set up

## Setup Instructions

1. Open your crontab file for editing:
   ```bash
   crontab -e
   ```

2. Add the following line to run the reseed script daily at 2:00 AM:
   ```bash
   0 2 * * * cd /home/mihon/workspace/thesis/laundry-system && yarn db:reseed >> /home/mihon/workspace/thesis/laundry-system/logs/reseed-$(date +\%Y\%m\%d).log 2>&1
   ```

3. Save and exit the editor.

4. Create a logs directory if it doesn't exist:
   ```bash
   mkdir -p /home/mihon/workspace/thesis/laundry-system/logs
   ```

## Explanation

- `0 2 * * *`: Run at 2:00 AM every day
- `cd /home/mihon/workspace/thesis/laundry-system`: Change to the project directory
- `yarn db:reseed`: Run the reseeding script
- `>> /home/mihon/workspace/thesis/laundry-system/logs/reseed-$(date +\%Y\%m\%d).log 2>&1`: Save the output to a date-stamped log file

## Verifying the Cron Job

To verify that your cron job is set up correctly:

```bash
crontab -l
```

You should see the line you added in the output.

## Customization

- To change the schedule, modify the cron expression (`0 2 * * *`).
  - Example: To run at 4:30 PM every day, use `30 16 * * *`
  - Example: To run every Sunday at midnight, use `0 0 * * 0`

- To test the script manually:
  ```bash
  yarn db:reseed
  ```
