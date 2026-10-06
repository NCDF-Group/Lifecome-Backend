CREATE TABLE "patient_avatars" (
	"patient_id" uuid PRIMARY KEY NOT NULL,
	"content_type" text NOT NULL,
	"image" "bytea" NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "avatar_updated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "patient_avatars" ADD CONSTRAINT "patient_avatars_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;