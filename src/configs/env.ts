import { config as configEnv } from 'dotenv';
import { str, cleanEnv, json, url } from 'envalid';

configEnv();

// Define NodeEnv type if it's not globally available
type NodeEnv = 'development' | 'test' | 'production';

export const envs = cleanEnv(process.env, {
    NODE_ENV: str<NodeEnv>({
        devDefault: 'development',
        choices: ['development', 'test', 'production'], // Added comma
    }),
    JWT_SECRET: str(),
    COOKIE_SECRET: str(),
    CORS_WHITE_LIST: json<string[]>({
        default: ['http://localhost:3000', 'http://localhost:8080'], // Added comma
    }),
    DISCORD_WEBHOOK_URL: str({ default: '' }),
    GOOGLE_CLIENT_ID: str({ default: '' }),
    GOOGLE_CLIENT_SECRET: str({ default: '' }),
    GOOGLE_REDIRECT_URL: url({ default: 'http://localhost:8080/auth/google/callback' }),
    UI_HOME_URL: url({ default: 'http://localhost:3000' }),
    LATITUDE_API_KEY: str({ default: '' }),
    LATITUDE_PROJECT_ID: str({ default: '' }), // Added comma
});
