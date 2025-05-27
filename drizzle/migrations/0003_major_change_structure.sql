CREATE TABLE "collaborator_assigments" (
	"id" serial PRIMARY KEY NOT NULL,
	"collaborator_id" integer NOT NULL,
	"member_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	"organization_id" integer,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "member_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_id" integer NOT NULL,
	"role_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organiztions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar,
	"description" varchar,
	"modified_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "collaborator_members" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "collaborator_roles" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "collaborator_members" CASCADE;--> statement-breakpoint
DROP TABLE "collaborator_roles" CASCADE;--> statement-breakpoint
ALTER TABLE "member" RENAME TO "members";--> statement-breakpoint
ALTER TABLE "project" RENAME TO "projects";--> statement-breakpoint
ALTER TABLE "role" RENAME TO "roles";--> statement-breakpoint
ALTER TABLE "user" RENAME TO "users";--> statement-breakpoint
ALTER TABLE "roles" DROP CONSTRAINT "role_name_unique";--> statement-breakpoint
ALTER TABLE "collaborator" DROP CONSTRAINT "collaborator_project_id_project_id_fk";
--> statement-breakpoint
ALTER TABLE "members" DROP CONSTRAINT "member_role_id_role_id_fk";
--> statement-breakpoint
ALTER TABLE "collaborator" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "is_valid" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "collaborator_assigments" ADD CONSTRAINT "collaborator_assigments_collaborator_id_collaborator_id_fk" FOREIGN KEY ("collaborator_id") REFERENCES "public"."collaborator"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaborator_assigments" ADD CONSTRAINT "collaborator_assigments_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaborator_assigments" ADD CONSTRAINT "collaborator_assigments_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaborator_assigments" ADD CONSTRAINT "collaborator_assigments_organization_id_organiztions_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organiztions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_roles" ADD CONSTRAINT "member_roles_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_roles" ADD CONSTRAINT "member_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaborator" ADD CONSTRAINT "collaborator_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaborator" DROP COLUMN "assigned_at";--> statement-breakpoint
ALTER TABLE "collaborator" DROP COLUMN "modified_at";--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_name_unique" UNIQUE("name");