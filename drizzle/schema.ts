import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
  jsonb,
} from 'drizzle-orm/pg-core';

// Enums
export const statusTagEnum = pgEnum('status_tag', [
  'active',
  'not_active',
  'upcoming',
  'ongoing',
]);
export const typeTagEnum = pgEnum('type_tag', [
  'internal',
  'external',
  'cross_orgs',
]);

export const project = pgTable('project', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  briefDesc: text('brief_desc').notNull(),
  fullDesc: text('full_desc').notNull(),
  dateLaunched: timestamp('date_launched').notNull(),
  links: jsonb('links').$type<{ name: string; link: string }[]>(),
  images: varchar('images', { length: 2048 }).array().notNull(),
  status: statusTagEnum('status').notNull(),
  type: typeTagEnum('type').notNull(),
  featured: boolean('featured').default(false).notNull(),
});

export const role = pgTable('role', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).unique().notNull(),
});

export const member = pgTable('member', {
  id: serial('id').primaryKey(),
  role_id: integer('role_id').references(() => role.id),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  photo: varchar('photo', { length: 2048 }).notNull(),
});

export const collaborator = pgTable('collaborator', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .references(() => project.id)
    .notNull(),
  assignedAt: timestamp('assigned_at').defaultNow().notNull(),
});

export const collaboratorMembers = pgTable('collaborator_members', {
  collaboratorId: integer('collaborator_id')
    .references(() => collaborator.id)
    .notNull(),
  memberId: integer('member_id')
    .references(() => member.id)
    .notNull(),
});

export const collaboratorRoles = pgTable('collaborator_roles', {
  collaboratorId: integer('collaborator_id')
    .references(() => collaborator.id)
    .notNull(),
  roleId: integer('role_id')
    .references(() => role.id)
    .notNull(),
});
export const batch = pgTable('batch', {
  id: serial('id').primaryKey(),
  batch_name: varchar('batch_name'),
});
export const alumni = pgTable('alumni', {
  id: serial('id').primaryKey(),
  batch_id: integer('batch_id').references(() => batch.id),
  fullname: varchar().notNull(),
});

export const event = pgTable('event', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).unique().notNull(),
});

export const blogs = pgTable('blogs', {
  id: serial('id').primaryKey(),
  title: varchar('title').notNull(),
  tag: integer('tag').references(() => event.id),
  cover_image: varchar('cover_image'),
  link: varchar('link'),
});
