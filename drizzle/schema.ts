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
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email').unique().notNull(),
  password: varchar('password').notNull(),
  modifiedAt: timestamp('modified_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  createdAt: timestamp('created_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).unique().notNull(),
  modifiedAt: timestamp('modified_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  createdAt: timestamp('created_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});
export const memberRoles = pgTable('member_roles', {
  id: serial('id').primaryKey(),
  memberId: integer('member_id')
    .references(() => members.id)
    .notNull(),
  roleId: integer('role_id')
    .references(() => roles.id)
    .notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const members = pgTable('members', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  photo: varchar('photo', { length: 2048 }),
  isVisible: boolean('is_visible').default(false),
  modifiedAt: timestamp('modified_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  createdAt: timestamp('created_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  briefDesc: text('brief_desc').notNull(),
  fullDesc: text('full_desc').notNull(),
  dateLaunched: timestamp('date_launched').notNull(),
  links: jsonb('links').$type<{ name: string; link: string }[]>(),
  images: varchar('images', { length: 2048 }).array(),
  status: statusTagEnum('status').notNull(),
  type: typeTagEnum('type').notNull(),
  featured: boolean('featured').default(false).notNull(),
  modifiedAt: timestamp('modified_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  createdAt: timestamp('created_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const collaborator = pgTable('collaborator', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .references(() => projects.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const collaboratorAssignments = pgTable('collaborator_assigments', {
  id: serial('id').primaryKey(),
  collaboratorId: integer('collaborator_id')
    .references(() => collaborator.id)
    .notNull(),
  roleId: integer('role_id')
    .references(() => roles.id)
    .notNull(),
  memberId: integer('member_id').references(() => members.id),
  organizationId: integer('organization_id').references(() => organizations.id),
  createdAt: timestamp('created_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const organizations = pgTable('organiztions', {
  id: serial('id').primaryKey(),
  name: varchar('name'),
  description: varchar('description'),

  modifiedAt: timestamp('modified_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  createdAt: timestamp('created_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const batch = pgTable('batch', {
  id: serial('id').primaryKey(),
  batchName: varchar('batch_name'),

  modifiedAt: timestamp('modified_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  createdAt: timestamp('created_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const alumni = pgTable('alumni', {
  id: serial('id').primaryKey(),
  batchId: integer('batch_id').references(() => batch.id),
  fullname: varchar().notNull(),

  modifiedAt: timestamp('modified_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  createdAt: timestamp('created_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const events = pgTable('event', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).unique().notNull(),

  modifiedAt: timestamp('modified_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  createdAt: timestamp('created_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const blogs = pgTable('blogs', {
  id: serial('id').primaryKey(),
  title: varchar('title').notNull(),
  tag: integer('tag').references(() => events.id),
  coverImage: varchar('cover_image'),
  link: varchar('link'),

  modifiedAt: timestamp('modified_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  createdAt: timestamp('created_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});
