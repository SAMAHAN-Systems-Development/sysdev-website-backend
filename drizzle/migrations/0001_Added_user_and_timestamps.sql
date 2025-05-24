CREATE TABLE "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"password" varchar NOT NULL,
	"modified_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "alumni" ADD COLUMN "modified_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "alumni" ADD COLUMN "created_at" timestamp;--> statement-breakpoint
ALTER TABLE "batch" ADD COLUMN "modified_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "batch" ADD COLUMN "created_at" timestamp;--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "modified_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "created_at" timestamp;--> statement-breakpoint
ALTER TABLE "collaborator" ADD COLUMN "modified_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "collaborator" ADD COLUMN "created_at" timestamp;--> statement-breakpoint
ALTER TABLE "collaborator_members" ADD COLUMN "modified_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "collaborator_members" ADD COLUMN "created_at" timestamp;--> statement-breakpoint
ALTER TABLE "collaborator_roles" ADD COLUMN "modified_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "collaborator_roles" ADD COLUMN "created_at" timestamp;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "modified_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "created_at" timestamp;--> statement-breakpoint
ALTER TABLE "member" ADD COLUMN "modified_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "member" ADD COLUMN "created_at" timestamp;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "modified_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "created_at" timestamp;--> statement-breakpoint
ALTER TABLE "role" ADD COLUMN "modified_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "role" ADD COLUMN "created_at" timestamp;