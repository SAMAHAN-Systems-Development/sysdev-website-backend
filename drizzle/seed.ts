import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import {
  project,
  member,
  role,
  collaborator,
  collaboratorMembers,
  collaboratorRoles,
  event,
  batch,
  alumni,
  blogs,
} from './schema'; // Adjust path as needed
import { faker } from '@faker-js/faker';
import { Logger } from '@nestjs/common';
dotenv.config();

const logger = new Logger('Seeder');
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}
const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 1,
});

const db = drizzle(pool);
export async function seedProjects() {
  logger.log('Seeding projects...');
  await db.insert(project).values([
    {
      title: 'Enterprise Portal',
      briefDesc: 'A portal for managing enterprise operations.',
      fullDesc: 'Full description for Enterprise Portal.',
      dateLaunched: new Date(),
      links: [
        { name: 'Production', link: 'https://example.com' },
        { name: 'Repository', link: 'https://github.com/example/enterprise' },
      ],
      images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
      status: 'active',
      type: 'internal',
      featured: true,
    },
  ]);
  logger.log('✅ Projects seeded');
}

export async function seedMembers() {
  logger.log('Seeding members...');
  await db.insert(member).values([
    {
      name: 'Alice Johnson',
      email: faker.internet.email(),
      photo: faker.image.avatar(),
    },
    {
      name: 'Bob Smith',
      email: faker.internet.email(),
      photo: faker.image.avatar(),
    },
  ]);
  logger.log('✅ Members seeded');
}

export async function seedRoles() {
  logger.log('Seeding roles...');
  await db.insert(role).values([{ name: 'Developer' }, { name: 'Designer' }]);
  logger.log('✅ Roles seeded');
}

export async function seedCollaborators() {
  logger.log('Seeding collaborators...');
  const [firstProject] = await db.select().from(project).limit(1);
  if (!firstProject)
    throw new Error('No project found to associate collaborators.');

  await db.insert(collaborator).values([
    {
      projectId: firstProject.id,
    },
  ]);
  logger.log('✅ Collaborators seeded');
}

export async function seedCollaboratorMembers() {
  logger.log('Seeding collaborator_members...');
  const [firstCollaborator] = await db.select().from(collaborator).limit(1);
  const membersList = await db.select().from(member);

  if (!firstCollaborator || membersList.length < 2)
    throw new Error('Missing collaborators or members');

  await db.insert(collaboratorMembers).values([
    { collaboratorId: firstCollaborator.id, memberId: membersList[0].id },
    { collaboratorId: firstCollaborator.id, memberId: membersList[1].id },
  ]);
  logger.log('✅ Collaborator members seeded');
}

export async function seedCollaboratorRoles() {
  logger.log('Seeding collaborator_roles...');
  const [firstCollaborator] = await db.select().from(collaborator).limit(1);
  const rolesList = await db.select().from(role);

  if (!firstCollaborator || rolesList.length < 2)
    throw new Error('Missing collaborators or roles');

  await db.insert(collaboratorRoles).values([
    { collaboratorId: firstCollaborator.id, roleId: rolesList[0].id },
    { collaboratorId: firstCollaborator.id, roleId: rolesList[1].id },
  ]);
  logger.log('✅ Collaborator roles seeded');
}
export async function seedBatches() {
  logger.log('Seeding batches...');
  await db
    .insert(batch)
    .values([{ batch_name: 'Batch Alpha' }, { batch_name: 'Batch Beta' }]);
  logger.log('✅ Batches seeded');
}

export async function seedAlumni() {
  logger.log('Seeding alumni...');
  const batches = await db.select().from(batch);
  if (batches.length === 0) throw new Error('No batches found');

  await db.insert(alumni).values([
    {
      batch_id: batches[0].id,
      fullname: faker.person.fullName(),
    },
    {
      batch_id: batches[1].id,
      fullname: faker.person.fullName(),
    },
  ]);
  logger.log('✅ Alumni seeded');
}

export async function seedEvents() {
  logger.log('Seeding events...');
  await db
    .insert(event)
    .values([{ name: 'Founders Day' }, { name: 'Hackathon 2025' }]);
  logger.log('✅ Events seeded');
}

export async function seedBlogs() {
  logger.log('Seeding blogs...');
  const events = await db.select().from(event);
  if (events.length === 0) throw new Error('No events found');

  await db.insert(blogs).values([
    {
      title: 'Celebrating Founders Day',
      tag: events[0].id,
      cover_image: faker.image.urlPicsumPhotos(),
      link: faker.internet.url(),
    },
    {
      title: 'Hackathon Highlights',
      tag: events[1].id,
      cover_image: faker.image.urlPicsumPhotos(),
      link: faker.internet.url(),
    },
  ]);
  logger.log('✅ Blogs seeded');
}

async function main() {
  try {
    logger.log('🌱 Starting seeding...');
    await seedProjects();
    await seedRoles();
    await seedMembers();
    await seedCollaborators();
    await seedCollaboratorMembers();
    await seedCollaboratorRoles();
    await seedBatches();
    await seedAlumni();
    await seedEvents();
    await seedBlogs();
    logger.log('🌱 Seeding complete');
  } catch (error) {
    logger.error('Seeding failed', error);
    console.log(error);
  } finally {
    await pool.end();
  }
}

main();
