CREATE TYPE "public"."funding_route" AS ENUM('pay_per_visit', 'lifecome_benefits', 'workplace', 'membership');--> statement-breakpoint
ALTER TYPE "public"."consultation_mode" ADD VALUE 'in_person';--> statement-breakpoint
ALTER TYPE "public"."staff_role" ADD VALUE 'clinician';--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "funding_route" "funding_route" DEFAULT 'pay_per_visit' NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "location_city" text;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "clinic_name" text;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "intake" jsonb;--> statement-breakpoint
ALTER TABLE "message_threads" ADD COLUMN "topic" text;--> statement-breakpoint
ALTER TABLE "staff_accounts" ADD COLUMN "provider_id" uuid;--> statement-breakpoint
ALTER TABLE "staff_accounts" ADD CONSTRAINT "staff_accounts_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE set null ON UPDATE no action;