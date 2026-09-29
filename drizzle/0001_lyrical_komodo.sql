CREATE TYPE "public"."notification_delivery_status" AS ENUM('queued', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."staff_account_status" AS ENUM('active', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."staff_role" AS ENUM('platform_administrator', 'clinical_administrator', 'hmo_operations', 'support_agent');--> statement-breakpoint
CREATE TABLE "staff_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"full_name" text NOT NULL,
	"role" "staff_role" NOT NULL,
	"status" "staff_account_status" DEFAULT 'active' NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipient_user_account_id" uuid NOT NULL,
	"channel" text NOT NULL,
	"template" text NOT NULL,
	"status" "notification_delivery_status" DEFAULT 'queued' NOT NULL,
	"job_id" text,
	"failure_reason" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "state" text;--> statement-breakpoint
ALTER TABLE "providers" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "providers" ADD COLUMN "state" text;--> statement-breakpoint
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_recipient_user_account_id_user_accounts_id_fk" FOREIGN KEY ("recipient_user_account_id") REFERENCES "public"."user_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "staff_accounts_email_idx" ON "staff_accounts" USING btree ("email");