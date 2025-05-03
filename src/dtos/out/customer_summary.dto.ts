import { Static, Type } from '@sinclair/typebox';
import { UserClassification } from '../common/enums.dto'; // Import the enum

// Define the structure for counts per classification
const ClassificationCountsDto = Type.Record(
    Type.Enum(UserClassification), // Keys are the enum values (New, Regular, Loyal, VIP)
    Type.Number({ description: 'Number of customers in this classification' }),
);

// Define the main response DTO for customer summary
export const CustomerSummaryResponseDto = Type.Object({
    totalCustomers: Type.Number({ description: 'Total number of registered customers' }),
    classificationCounts: ClassificationCountsDto,
});

export type CustomerSummaryResponseDto = Static<typeof CustomerSummaryResponseDto>;
