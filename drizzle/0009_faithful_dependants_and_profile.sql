ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "address" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "blood_group" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "genotype" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "emergency_contact_name" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "emergency_contact_phone" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "emergency_contact_relationship" text;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "patient_dependants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"relationship" text NOT NULL,
	"date_of_birth" date NOT NULL,
	"gender" text,
	"blood_group" text,
	"genotype" text,
	"status" text DEFAULT 'Covered' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patient_dependants" ADD CONSTRAINT "patient_dependants_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
