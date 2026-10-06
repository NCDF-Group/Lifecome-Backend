CREATE TYPE "public"."patient_notification_kind" AS ENUM('booking', 'message', 'support', 'record');--> statement-breakpoint
CREATE TABLE "patient_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"kind" "patient_notification_kind" NOT NULL,
	"body" text NOT NULL,
	"highlights" text[] DEFAULT '{}' NOT NULL,
	"preview" text,
	"action_label" text,
	"action_target" text,
	"action_ref" uuid,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "patient_notifications" ADD CONSTRAINT "patient_notifications_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;