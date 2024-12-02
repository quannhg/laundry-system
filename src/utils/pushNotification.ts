import { prisma } from '@repositories';
import { logger } from './logger';
import admin from 'firebase-admin';
import { BaseMessage } from 'firebase-admin/lib/messaging/messaging-api';

async function pushNotification(userId: string, message: BaseMessage) {
    try {
        const userToken = await prisma.fCMToken.findFirst({ where: { userId } });

        if (!userToken) {
            logger.warn(`No FCM tokens found for user ${userId}`);
            return;
        }

        const notificationsEnabled = await checkNotificationsEnabled(userId);
        if (!notificationsEnabled) {
            logger.info(`Notifications are disabled for user ${userId}`);
            return;
        }

        const sendingMessage: admin.messaging.Message = {
            ...message,
            token: userToken.token,
        };

        await admin.messaging().send(sendingMessage);
    } catch (error) {
        logger.error(`Error sending notification: ${error}`);
    }
}

async function checkNotificationsEnabled(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    return user ? user.enableNotification : false;
}

export { pushNotification };
