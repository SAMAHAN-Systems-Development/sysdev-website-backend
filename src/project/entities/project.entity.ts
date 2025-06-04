import { InferSelectModel } from 'drizzle-orm';
import { projects } from 'drizzle/schema';

export type Project = InferSelectModel<typeof projects>;
