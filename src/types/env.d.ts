type NodeEnv = 'development' | 'production' | 'test';

declare global {
    namespace NodeJS {
        interface ProcessEnv extends Env {}
    }
}

export interface Env {
    NODE_ENV: 'development' | 'test' | 'production';
    JWT_SECRET: string;
    COOKIE_SECRET: string;
    CORS_WHITE_LIST: string[];
    DISCORD_WEBHOOK_URL?: string;
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET: string;
    GOOGLE_REDIRECT_URL: string;
    UI_HOME_URL: string;
    LATITUDE_API_KEY: string; // Added
    LATITUDE_PROJECT_ID: string; // Added
}
