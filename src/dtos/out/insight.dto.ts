import { Type, Static } from '@sinclair/typebox'; // Import Type and Static

// Use Type.Object, Type.Array, Type.String
export const InsightResponseDto = Type.Object({
    insights: Type.Array(Type.String(), { description: 'List of AI-generated insights' }),
});

export type InsightResponseDto = Static<typeof InsightResponseDto>;
