import { Handler } from '@interfaces';
import { prisma } from '@repositories';
import { logger, getUserClassification } from '@utils';
import { CustomerSummaryResponseDto } from '@dtos/out';
import { UserClassification } from '@dtos/common';
import { OrderStatus } from '@prisma/client';

/**
 * Retrieves a summary of customer counts by classification.
 *
 * @returns {CustomerSummaryResponseDto} Summary of total customers and counts per classification.
 *
 * @throws {500} Database or server error
 */
const getSummary: Handler<CustomerSummaryResponseDto> = async (req, res) => {
    try {
        // Fetch all users with necessary order data for classification
        // Note: Similar performance concern as getCustomerStats - fetches all users.
        // Consider optimizing if performance becomes an issue (e.g., raw SQL aggregation).
        const users = await prisma.user.findMany({
            include: {
                _count: {
                    select: {
                        orders: true, // Need total order count
                    },
                },
                orders: {
                    select: {
                        price: true, // Need price for spending calculation
                        status: true,
                    },
                    where: {
                        // Only consider relevant orders for spending
                        status: {
                            in: [OrderStatus.FINISHED, OrderStatus.CONFIRMED],
                        },
                    },
                },
            },
        });

        const totalCustomers = users.length;
        const classificationCounts: Record<UserClassification, number> = {
            [UserClassification.NEW]: 0,
            [UserClassification.REGULAR]: 0,
            [UserClassification.LOYAL]: 0,
            [UserClassification.VIP]: 0,
        };

        // Classify each user and increment counts
        for (const user of users) {
            const orderCount = user._count.orders;
            const totalSpending = user.orders.reduce((sum, order) => sum + (order.price || 0), 0);
            const classification = getUserClassification(orderCount, totalSpending);
            classificationCounts[classification]++;
        }

        const response: CustomerSummaryResponseDto = {
            totalCustomers,
            classificationCounts,
        };

        return res.send(response);
    } catch (error) {
        logger.error(`Error getting customer summary: ${error}`);
        return res.internalServerError(error);
    }
};

export const customerSummaryHandler = {
    getSummary,
};
