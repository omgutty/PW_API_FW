import * as dotenv from 'dotenv';

dotenv.config();

interface Env{
    baseUrl: string;
    authUsername: string;
    authPassword: string;
}

function requireEnv(key:string){
    const value= process.env[key];
    if(!value){
        throw new Error(`Missing required environment variable: ${key}. Check your .env file against .env.example.`);
    }
    return value;
}

export const env:Env= {
    baseUrl: requireEnv('BASE_URL'),
    authUsername: requireEnv('AUTH_USERNAME'),
    authPassword:requireEnv('AUTH_PASSWORD')
}

/**
 * Without this file, a missing env var doesn't fail loudly.
 * It fails silently and confusingly — 
 * e.g., process.env.AUTH_USERNAME is just undefined, 
 * gets interpolated into a request body as the string "undefined",
 * the API rejects it with some cryptic 400,
 * and you spend 20 minutes debugging the wrong layer 
 * (thinking it's an API bug, when it's actually a missing .env file).
 */


