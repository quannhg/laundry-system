import { UserClassification } from '@dtos/common';

/**
 * Determines the classification of a user based on their order count and total spending.
 * @param orderCount - The total number of orders placed by the user.
 * @param totalSpending - The total amount spent by the user across orders (in VND).
 * @returns The user's classification (New, Regular, Loyal, VIP).
 */
export function getUserClassification(orderCount: number, totalSpending: number): UserClassification {
    if (orderCount === 0) return UserClassification.NEW;

    // Define thresholds for classification (consider making these configurable)
    const VIP_ORDER_THRESHOLD = 10;
    const VIP_SPENDING_THRESHOLD = 500000; // Example VND
    const LOYAL_ORDER_THRESHOLD = 5;
    const LOYAL_SPENDING_THRESHOLD = 200000; // Example VND

    if (orderCount > VIP_ORDER_THRESHOLD || totalSpending > VIP_SPENDING_THRESHOLD) {
        return UserClassification.VIP;
    }
    if (orderCount > LOYAL_ORDER_THRESHOLD || totalSpending > LOYAL_SPENDING_THRESHOLD) {
        return UserClassification.LOYAL;
    }
    return UserClassification.REGULAR;
}
