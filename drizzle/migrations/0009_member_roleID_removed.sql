ALTER TABLE "members" DROP CONSTRAINT "members_role_id_roles_id_fk";
--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "images" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "members" DROP COLUMN "role_id";