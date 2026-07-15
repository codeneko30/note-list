import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = 'postgresql://neondb_owner:npg_7szcQj8MeWwu@ep-red-sun-aoteso1i-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const client = postgres(connectionString);
export const db = drizzle(client, { schema })
