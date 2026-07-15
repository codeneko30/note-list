import type { Config } from 'drizzle-kit';

export default {
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgresql://neondb_owner:npg_7szcQj8MeWwu@ep-red-sun-aoteso1i-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
  },
} satisfies Config;
