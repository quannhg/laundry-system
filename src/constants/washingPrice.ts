import { WashingMode } from '@prisma/client';

export const WashingPrice: Record<WashingMode, number> = {
    [WashingMode.NORMAL]: 25000,
    [WashingMode.THOROUGHLY]: 35000,
};

export const SoakPrice = 10000;

export const PaymentMethod = ['momo', 'visa'];
