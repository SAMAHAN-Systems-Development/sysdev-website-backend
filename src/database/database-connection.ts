import { NodePgDatabase } from 'drizzle-orm/node-postgres';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';
export type Database = NodePgDatabase;
