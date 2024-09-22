import { config as configEnv } from 'dotenv';
import { str, cleanEnv, json, url } from 'envalid';

configEnv();

export const envs = cleanEnv(process.env, {
    NODE_ENV: str<NodeEnv>({
        devDefault: 'development',
        choices: ['development', 'test', 'production']
    }),
    JWT_SECRET: str(),
    COOKIE_SECRET: str(),
    CORS_WHITE_LIST: json<string[]>({
        default: ['http://localhost:3000', 'http://localhost:8080']
    }),
    DISCORD_WEBHOOK_URL: str({ default: '' }),
    GOOGLE_CLIENT_ID: str({ default: '' }),
    GOOGLE_CLIENT_SECRET: str(),
    GOOGLE_REDIRECT_URL: url(),
    UI_HOME_URL: url()
});
