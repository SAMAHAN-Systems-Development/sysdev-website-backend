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
export async function seedProjectss() {
  logger.log('Seeding projectss...');
  await db.insert(projects).values([
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
  logger.log('✅ Projectss seeded');
}

export async function seedMemberss() {
  logger.log('Seeding memberss...');
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

export async function seedRoless() {
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

export async function seedEventss() {
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
      cover_image: faker.image.urlPicsumPhotos(),
      link: faker.internet.url(),
    },
    {
      title: 'Hackathon Highlights',
      tag: eventss[1].id,
      cover_image: faker.image.urlPicsumPhotos(),
      link: faker.internet.url(),
    },
  ]);
  logger.log('✅ Blogs seeded');
}

export async function seedUserss() {
  try {
    const usersData = [
      {
        email: 'aj1@gmail.com',
        password: 'secretPassword',
      },
      {
        email: 'aj2@gmail.com',
        password: 'secretPassword',
      },
    ];

    for (const users of usersData) {
      users.password = await bcrypt.hash(users.password, 10);
    }

    await db.insert(users).values(usersData);
    Logger.log('Users Added');
  } catch (error) {
    Logger.error('Users might already exists, or something went wrong', error);
  }
}

async function main() {
  try {
    logger.log('🌱 Starting seeding...');
    await createBucket(process.env.IMAGE_BUCKET);
    await seedUserss();
    await seedProjectss();
    await seedRoless();
    await seedMemberss();
    await seedCollaborators();
    await seedBatches();
    await seedAlumni();
    await seedEventss();
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
