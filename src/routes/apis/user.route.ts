import { CustomerStatQueryDto, UserInputDto } from '@dtos/in';
import { CustomerStatResponseDto, UserResultDto, CustomerSummaryResponseDto } from '@dtos/out'; // Add CustomerSummaryResponseDto
import { usersHandler, customerSummaryHandler } from '@handlers'; // Add customerSummaryHandler
import { createRoutes } from '@utils';
import { NotificationResultDto } from '../../dtos/out/notification.dto';
import { NotificationInputDto } from '../../dtos/in/notification.dto';

export const userPlugin = createRoutes('User', [
    {
        method: 'GET',
        url: '/',
        schema: {
            response: {
                200: UserResultDto,
            },
            security: [{ bearerAuth: [] }],
        },
        handler: usersHandler.getUserById,
    },
    {
        method: 'GET',
        url: '/:id',
        schema: {
            params: { id: { type: 'string' } },
            response: {
                200: UserResultDto,
            },
            security: [{ bearerAuth: [] }],
        },
        handler: usersHandler.findUserById,
    },
    {
        method: 'GET',
        url: '/stats/customers',
        schema: {
            querystring: CustomerStatQueryDto,
            response: {
                200: CustomerStatResponseDto,
            },
            security: [{ bearerAuth: [] }],
        },
        handler: usersHandler.getCustomerStats,
    },
    {
        // Add new summary endpoint
        method: 'GET',
        url: '/stats/summary',
        schema: {
            summary: 'Get Customer Classification Summary',
            description: 'Retrieves the total number of customers and the count within each classification (New, Regular, Loyal, VIP).',
            response: {
                200: CustomerSummaryResponseDto,
            },
            security: [{ bearerAuth: [] }],
        },
        handler: customerSummaryHandler.getSummary,
    },
    {
        method: 'PUT',
        url: '/',
        schema: {
            body: UserInputDto,
            response: {
                200: UserResultDto,
            },
            security: [{ bearerAuth: [] }],
        },
        handler: usersHandler.updateUser,
    },
    {
        method: 'POST',
        url: '/fcm-token',
        schema: {
            body: NotificationInputDto,
            response: {
                200: NotificationResultDto,
            },
            security: [{ bearerAuth: [] }],
        },
        handler: usersHandler.addFCMToken,
    },
]);
