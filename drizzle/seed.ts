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
  clients,
  clientProjects,
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
      title: 'FYLP Website',
      briefDesc:
        'A digital hub for the convention, providing attendees with essential information and features.',
      fullDesc:
        'A digital hub for the convention, providing attendees with essential information and features such as registration, program flow, speaker details, FAQs, and more.',
      dateLaunched: new Date('2024-08-01T00:00:00.000Z'),
      links: [
        {
          link: 'https://misscon2025.info/',
          name: 'Production',
        },
        {
          link: 'https://github.com/SAMAHAN-Systems-Development/FYLP-frontend-2024',
          name: 'Repository',
        },
      ],
      images: [
        'project-images/fylp-1.png',
        'project-images/fylp-2.png',
        'project-images/fylp-3.png',
      ],
      status: 'active',
      type: 'not_set',
      featured: false,
    },
    {
      title: 'SAMAHAN PALARO 2024',
      briefDesc:
        'A commemorative website showcasing the highlights and memories of SAMAHAN Palaro 2024.',
      fullDesc:
        'The SAMAHAN PALARO 2024 website was created as a digital archive to celebrate and preserve the spirit of this year’s university-wide sports festival. It features event highlights, photos, and important moments that defined the Palaro experience for the Ateneo community.',
      dateLaunched: new Date('2025-05-01T00:00:00.000Z'),
      links: [
        {
          link: 'https://samahan.addu.edu.ph/palaro-2024/',
          name: 'Production',
        },
        {
          link: 'https://github.com/SAMAHAN-Systems-Development/samahan-palaro-2024',
          name: 'Repository',
        },
      ],
      images: [
        'project-images/palaro-1.png',
        'project-images/palaro-2.png',
        'project-images/palaro-3.png',
      ],
      status: 'active',
      type: 'not_set',
      featured: true,
    },
    {
      title: 'MISSCON 2025',
      briefDesc:
        'A digital hub for the convention, providing attendees with essential information and features.',
      fullDesc:
        'A digital hub for the convention, providing attendees with essential information and features such as registration, program flow, speaker details, FAQs, and more.',
      dateLaunched: new Date('2025-01-01T00:00:00.000Z'),
      links: [
        {
          link: 'https://misscon2025.info/',
          name: 'Production',
        },
        {
          link: 'https://github.com/SAMAHAN-Systems-Development/MISSCON-2025',
          name: 'Repository',
        },
      ],
      images: [
        'project-images/misscon-1.png',
        'project-images/misscon-2.png',
        'project-images/misscon-3.png',
      ],
      status: 'active',
      type: 'not_set',
      featured: false,
    },
    {
      title: 'SAMAHAN Newsfeed',
      briefDesc:
        'An annual publication by SAMAHAN Communications that chronicles student life and events through powerful storytelling.',
      fullDesc:
        'The SAMAHAN NewsFeed is an annual publication spearheaded by SAMAHAN Communications, the official public affairs and information arm of SAMAHAN. It serves as a platform where voices carry weight and moments find permanence—woven into compelling narratives that reflect the shared journey of Ateneans throughout the academic year. Through this initiative, the department champions the power of storytelling, fostering meaningful communication and connection within the university.',
      dateLaunched: new Date('2025-05-01T00:00:00.000Z'),
      links: [
        {
          link: 'https://samahan.addu.edu.ph/newsfeed/',
          name: 'Production',
        },
        {
          link: 'https://github.com/SAMAHAN-Systems-Development/SAMAHAN-Newsfeed-Frontend',
          name: 'Repository',
        },
      ],
      images: [
        'project-images/newsfeed-1.png',
        'project-images/newsfeed-2.png',
        'project-images/newsfeed-3.png',
      ],
      status: 'active',
      type: 'not_set',
      featured: false,
    },
  ]);
  logger.log('✅ Projects seeded');
}
import * as path from 'path';
import { readFile } from 'fs/promises';

async function loadMembersJson() {
  const __dirname = path.dirname(__filename);
  const raw = await readFile(
    path.join(__dirname, 'updated-members.json'),
    'utf-8',
  );
  return JSON.parse(raw) as Array<{
    name: string;
    email: string;
    photo: string;
    roles: Array<{ roles: { name: string } }>;
  }>;
}
export async function seedMembers() {
  logger.log('Seeding members...');
  const membersJson = await loadMembersJson();

  const memberValues = membersJson.map((m) => ({
    name: m.name,
    email: m.email,
    photo: m.photo,
    isVisible: true,
  }));

  await db.insert(members).values(memberValues);
  logger.log(`✅ Seeded ${memberValues.length} members`);
}

export async function seedMemberRoles() {
  logger.log('Seeding member roles...');
  const membersJson = await loadMembersJson();

  const dbMembers = await db.select().from(members);
  const dbRoles = await db.select().from(roles);

  const memberRoleValues: Array<{ memberId: number; roleId: number }> = [];

  for (const member of membersJson) {
    const dbMember = dbMembers.find((m) => m.email === member.email);
    if (!dbMember) continue;

    for (const roleObj of member.roles) {
      const roleName = roleObj.roles.name;
      const dbRole = dbRoles.find((r) => r.name === roleName);
      if (!dbRole) continue;

      memberRoleValues.push({
        memberId: dbMember.id,
        roleId: dbRole.id,
      });
    }
  }

  await db.insert(memberRoles).values(memberRoleValues);
  logger.log(`✅ Seeded ${memberRoleValues.length} member-role assignments`);
}
import membersJson from './updated-members.json';

export async function seedRoles() {
  logger.log('Seeding roles...');

  const roleSet = new Set<string>();

  for (const member of membersJson) {
    for (const roleObj of member.roles) {
      roleSet.add(roleObj.roles.name);
    }
  }

  const roleValues = [...roleSet].map((name) => ({
    name,
  }));

  await db.insert(roles).values(roleValues);
  logger.log(`✅ Seeded ${roleValues.length} unique roles`);
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
export async function seedClients() {
  const clientsData = Array.from({ length: 5 }).map(() => ({
    name: faker.person.fullName(),
  }));
  await db.insert(clients).values(clientsData);
}
export async function seedClientsProjects() {
  const projectData = await db.select().from(projects);
  await db.insert(clientProjects).values([
    { projectId: projectData[0].id, clientId: 1 },
    { projectId: projectData[0].id, clientId: 2 },
    { projectId: projectData[0].id, clientId: 3 },
    { projectId: projectData[0].id, clientId: 4 },
    { projectId: projectData[1].id, clientId: 1 },
    { projectId: projectData[1].id, clientId: 2 },
  ]);
}
async function main() {
  try {
    logger.log('🌱 Starting seeding...');
    await createBucket(process.env.IMAGE_BUCKET);
    await seedUsers();
    await seedProjects();
    await seedClients();
    await seedClientsProjects();
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
