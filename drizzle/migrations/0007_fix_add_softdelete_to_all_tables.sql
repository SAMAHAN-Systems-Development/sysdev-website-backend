ALTER TABLE "alumni" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "batch" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "member_roles" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deleted_at" timestamp;