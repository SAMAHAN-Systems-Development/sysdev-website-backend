import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import {
  Database,
  DATABASE_CONNECTION,
} from 'src/database/database-connection';
import { projects, collaborator, collaboratorAssignments, members, roles } from 'drizzle/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class ProjectService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}
  create(createProjectDto: CreateProjectDto) {
    return 'This action adds a new project';
  }

  findAll() {
    return this.db.select().from(projects);
  }

  async findOne(id: number) {
  const [proj] = await this.db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);

  if (!proj) {
    throw new NotFoundException(`Project with ID ${id} not found.`);
  }

  const projectCollaborators = await this.db
    .select()
    .from(collaborator)
    .where(eq(collaborator.projectId, id));

  const collaboratorsWithMembersByRole = await Promise.all(
    projectCollaborators.map(async (collab) => {
      const assignments = await this.db
        .select()
        .from(collaboratorAssignments)
        .where(eq(collaboratorAssignments.collaboratorId, collab.id));

      const membersByRole: Record<string, any[]> = {};

      for (const assign of assignments) {
        const [[member], [role]] = await Promise.all([
          this.db
            .select()
            .from(members)
            .where(eq(members.id, assign.memberId))
            .limit(1),

          this.db
            .select()
            .from(roles)
            .where(eq(roles.id, assign.roleId))
            .limit(1),
        ]);

        const roleName = role?.name ?? 'Unknown';

        if (!membersByRole[roleName]) {
          membersByRole[roleName] = [];
        }

        membersByRole[roleName].push(member);
      }

      return {
        collaborator: collab,
        membersByRole,
      };
    })
  );

  const imageObjects = (proj.images || []).map((url: string) => ({
    url,
    caption: null,
  }));

  return {
    title: proj.title,
    dateLaunched: proj.dateLaunched,
    briefDesc: proj.briefDesc,
    fullDesc: proj.fullDesc,
    collaborators: collaboratorsWithMembersByRole,
    images: imageObjects,
    links: proj.links,
    status: proj.status,
    type: proj.type,
    featured: proj.featured,
  };
}

  update(id: number, updateProjectDto: UpdateProjectDto) {
    return `This action updates a #${id} project`;
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }
}
