import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import {
  projects,
  members,
  roles,
  collaborator,
  events,
  batch,
  alumni,
  blogs,
  users,
  memberRoles,
  organizations,
  collaboratorAssignments,
} from './schema'; // Adjust path as needed
import { faker } from '@faker-js/faker';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateBucketCommand, S3Client } from '@aws-sdk/client-s3';
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
const s3 = new S3Client({
  region: 'asia',
  endpoint: 'http://localhost:9000',
  forcePathStyle: true,
  credentials: {
    accessKeyId: 'minioadmin',
    secretAccessKey: 'minioadmin123',
  },
});

async function createBucket(bucketName: string) {
  try {
    await s3.send(new CreateBucketCommand({ Bucket: bucketName }));
    logger.log(`✅ Bucket "${bucketName}" created`);
  } catch (error: any) {
    if (error.Code === 'BucketAlreadyOwnedByYou') {
      logger.log(`⚠️ Bucket "${bucketName}" already exists`);
    } else {
      logger.error('❌ Error creating bucket:', error.message || error);
    }
  }
}
const db = drizzle(pool);
export async function seedProjects() {
  logger.log('Seeding projectss...');
  await db.insert(projects).values([
    {
      title: 'Student Management System',
      briefDesc: 'A system for managing student records and activities.',
      fullDesc: 'Full description for Student Management System.',
      dateLaunched: new Date(),
      links: [
        { name: 'Production', link: 'https://example.com' },
        { name: 'Repository', link: 'https://github.com/example/student-mgmt' },
      ],
      images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
      status: 'active',
      type: 'internal',
      featured: true,
    },
    {
      title: 'Inventory Tracker',
      briefDesc: 'Tracks inventory for small businesses.',
      fullDesc: 'Full description for Inventory Tracker.',
      dateLaunched: new Date(),
      links: [
        { name: 'Production', link: 'https://example.com' },
        { name: 'Repository', link: 'https://github.com/example/inventory' },
      ],
      images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
      status: 'active',
      type: 'internal',
      featured: true,
    },
    {
      title: 'Event Scheduler',
      briefDesc: 'Schedules and manages events efficiently.',
      fullDesc: 'Full description for Event Scheduler.',
      dateLaunched: new Date(),
      links: [
        { name: 'Production', link: 'https://example.com' },
        {
          name: 'Repository',
          link: 'https://github.com/example/event-scheduler',
        },
      ],
      images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
      status: 'active',
      type: 'internal',
      featured: true,
    },
    {
      title: 'Online Learning Platform',
      briefDesc: 'A platform for online courses and learning.',
      fullDesc: 'Full description for Online Learning Platform.',
      dateLaunched: new Date(),
      links: [
        { name: 'Production', link: 'https://example.com' },
        {
          name: 'Repository',
          link: 'https://github.com/example/learning-platform',
        },
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
  await db.insert(members).values([
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
  logger.log('✅ Memberss seeded');
}
export async function seedMemberRoles() {
  logger.log('Seeding Member Roles..');
  const membersData = await db.select().from(members);
  const rolesData = await db.select().from(roles);
  await db.insert(memberRoles).values([
    {
      memberId: membersData[0].id,
      roleId: rolesData[0].id,
    },
    {
      memberId: membersData[0].id,
      roleId: rolesData[0].id,
    },
  ]);
  logger.log('✅ Member Roles seeded');
}
export async function seedRoles() {
  logger.log('Seeding roless...');
  await db.insert(roles).values([{ name: 'Developer' }, { name: 'Designer' }]);
  logger.log('✅ Roless seeded');
}

export async function seedCollaborators() {
  logger.log('Seeding collaborators...');
  const [firstProjects] = await db.select().from(projects).limit(1);
  if (!firstProjects)
    throw new Error('No projects found to associate collaborators.');

  await db.insert(collaborator).values([
    {
      projectId: firstProjects.id,
    },
  ]);
  logger.log('✅ Collaborators seeded');
}
export async function seedCollaboratorAssignment() {
  logger.log('Seeding collaborator Assignments');
  const role = await db.select().from(roles);
  const orgs = await db.select().from(organizations);
  const member = await db.select().from(members);
  const collaborators = await db.select().from(collaborator);
  await db.insert(collaboratorAssignments).values([
    {
      collaboratorId: collaborators[0].id,
      roleId: role[0].id,
      organizationId: orgs[0].id,
    },
    {
      collaboratorId: collaborators[0].id,
      roleId: role[0].id,
      organizationId: orgs[1].id,
    },

    {
      collaboratorId: collaborators[0].id,
      roleId: role[1].id,
      organizationId: orgs[2].id,
    },
    {
      collaboratorId: collaborators[0].id,
      roleId: role[1].id,
      organizationId: orgs[3].id,
    },
    {
      collaboratorId: collaborators[0].id,
      roleId: role[1].id,
      organizationId: orgs[4].id,
    },
    {
      collaboratorId: collaborators[0].id,
      roleId: role[0].id,
      memberId: member[0].id,
    },
    {
      collaboratorId: collaborators[0].id,
      roleId: role[0].id,
      memberId: member[1].id,
    },
  ]);
  logger.log('✅ Collaborator Assignments seeded');
}
export async function seedOrganiztions() {
  logger.log('Seeding Organiztions');
  const data = Array.from({ length: 5 }).map(() => ({
    name: faker.company.name(),
    description: faker.company.catchPhrase(),
  }));
  await db.insert(organizations).values(data);

  logger.log('✅ Organiztions seeded');
}
export async function seedBatches() {
  logger.log('Seeding batches...');
  await db
    .insert(batch)
    .values([{ batchName: 'Batch Alpha' }, { batchName: 'Batch Beta' }]);
  logger.log('✅ Batches seeded');
}

export async function seedAlumni() {
  logger.log('Seeding alumni...');
  const batches = await db.select().from(batch);
  if (batches.length === 0) throw new Error('No batches found');

  await db.insert(alumni).values([
    {
      batchId: batches[0].id,
      fullname: faker.person.fullName(),
    },
    {
      batchId: batches[1].id,
      fullname: faker.person.fullName(),
    },
  ]);
  logger.log('✅ Alumni seeded');
}

export async function seedEvents() {
  logger.log('Seeding eventss...');
  await db
    .insert(events)
    .values([{ name: 'Founders Day' }, { name: 'Hackathon 2025' }]);
  logger.log('✅ Eventss seeded');
}

export async function seedBlogs() {
  logger.log('Seeding blogs...');
  const eventss = await db.select().from(events);
  if (eventss.length === 0) throw new Error('No eventss found');

  await db.insert(blogs).values([
    {
      title: 'Celebrating Founders Day',
      tag: eventss[0].id,
      coverImage: faker.image.urlPicsumPhotos(),
      link: faker.internet.url(),
    },
    {
      title: 'Hackathon Highlights',
      tag: eventss[1].id,
      coverImage: faker.image.urlPicsumPhotos(),
      link: faker.internet.url(),
    },
  ]);
  logger.log('✅ Blogs seeded');
}

export async function seedUsers() {
  try {
    const usersData = [
      {
        email: 'admin@admin.com',
        password: 'admin',
      },
    ];

    for (const users of usersData) {
      users.password = await bcrypt.hash(users.password, 10);
    }

    await db.insert(users).values(usersData);
    logger.log('Users Added');
  } catch (error) {
    logger.error('Users might already exists, or something went wrong', error);
  }
}

async function main() {
  try {
    logger.log('🌱 Starting seeding...');
    await createBucket(process.env.IMAGE_BUCKET);
    await seedUsers();
    await seedProjects();
    await seedRoles();
    await seedMembers();
    await seedMemberRoles();
    await seedCollaborators();
    await seedOrganiztions();
    await seedCollaboratorAssignment();
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
