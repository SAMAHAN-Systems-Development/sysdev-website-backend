CREATE TYPE "public"."status_tag" AS ENUM('active', 'not_active', 'upcoming', 'ongoing');--> statement-breakpoint
CREATE TYPE "public"."type_tag" AS ENUM('internal', 'external', 'cross_orgs');--> statement-breakpoint
CREATE TABLE "alumni" (
	"id" serial PRIMARY KEY NOT NULL,
	"batch_id" integer,
	"fullname" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "batch" (
	"id" serial PRIMARY KEY NOT NULL,
	"batch_name" varchar
);
--> statement-breakpoint
CREATE TABLE "blogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"tag" integer,
	"cover_image" varchar,
	"link" varchar
);
--> statement-breakpoint
CREATE TABLE "collaborator" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collaborator_members" (
	"collaborator_id" integer NOT NULL,
	"member_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collaborator_roles" (
	"collaborator_id" integer NOT NULL,
	"role_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "event_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_id" integer,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"photo" varchar(2048) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"brief_desc" text NOT NULL,
	"full_desc" text NOT NULL,
	"date_launched" timestamp NOT NULL,
	"links" jsonb,
	"images" varchar(2048)[] NOT NULL,
	"status" "status_tag" NOT NULL,
	"type" "type_tag" NOT NULL,
	"featured" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "role_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "alumni" ADD CONSTRAINT "alumni_batch_id_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_tag_event_id_fk" FOREIGN KEY ("tag") REFERENCES "public"."event"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaborator" ADD CONSTRAINT "collaborator_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaborator_members" ADD CONSTRAINT "collaborator_members_collaborator_id_collaborator_id_fk" FOREIGN KEY ("collaborator_id") REFERENCES "public"."collaborator"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaborator_members" ADD CONSTRAINT "collaborator_members_member_id_member_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."member"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaborator_roles" ADD CONSTRAINT "collaborator_roles_collaborator_id_collaborator_id_fk" FOREIGN KEY ("collaborator_id") REFERENCES "public"."collaborator"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaborator_roles" ADD CONSTRAINT "collaborator_roles_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE no action ON UPDATE no action;