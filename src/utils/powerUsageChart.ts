import { PeriodType } from '@dtos/in/power_usage_chart.dto';

interface PeriodConfig {
    interval: string;
    format: string;
    points: number;
    getStartDate: (date?: Date) => Date;
    getEndDate: (startDate: Date) => Date;
}

const PERIOD_CONFIGS: Record<PeriodType, PeriodConfig> = {
    day: {
        interval: 'hour',
        format: 'HH:00',
        points: 24,
        getStartDate: (date?: Date) => {
            const d = date ? new Date(date) : new Date();
            d.setHours(0, 0, 0, 0);
            return d;
        },
        getEndDate: (startDate: Date) => {
            const d = new Date(startDate);
            d.setDate(d.getDate() + 1);
            d.setMilliseconds(-1);
            return d;
        },
    },
    week: {
        interval: 'day',
        format: 'YYYY-MM-DD',
        points: 7,
        getStartDate: (date?: Date) => {
            const d = date ? new Date(date) : new Date();
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() - d.getDay()); // Start from Sunday
            return d;
        },
        getEndDate: (startDate: Date) => {
            const d = new Date(startDate);
            d.setDate(d.getDate() + 7);
            d.setMilliseconds(-1);
            return d;
        },
    },
    month: {
        interval: 'day',
        format: 'YYYY-MM-DD',
        points: 31,
        getStartDate: (date?: Date) => {
            const d = date ? new Date(date) : new Date();
            d.setHours(0, 0, 0, 0);
            d.setDate(1); // Start of month
            return d;
        },
        getEndDate: (startDate: Date) => {
            const d = new Date(startDate);
            d.setMonth(d.getMonth() + 1);
            d.setMilliseconds(-1);
            return d;
        },
    },
    year: {
        interval: 'month',
        format: 'YYYY-MM',
        points: 12,
        getStartDate: (date?: Date) => {
            const d = date ? new Date(date) : new Date();
            d.setHours(0, 0, 0, 0);
            d.setMonth(0, 1); // Start of year
            return d;
        },
        getEndDate: (startDate: Date) => {
            const d = new Date(startDate);
            d.setFullYear(d.getFullYear() + 1);
            d.setMilliseconds(-1);
            return d;
        },
    },
};

export function getPeriodDates(period: PeriodType, startDate?: Date): { start: Date; end: Date } {
    const config = PERIOD_CONFIGS[period];
    const start = config.getStartDate(startDate);
    const end = config.getEndDate(start);
    return { start, end };
}

export function getIntervalForPeriod(period: PeriodType): string {
    return PERIOD_CONFIGS[period].interval;
}

export function getExpectedDataPoints(period: PeriodType): number {
    return PERIOD_CONFIGS[period].points;
}

export function getDateFormat(period: PeriodType): string {
    return PERIOD_CONFIGS[period].format;
}
