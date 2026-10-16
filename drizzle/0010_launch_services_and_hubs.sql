ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "clinic_address" text;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "arrival_instructions" text;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "service_category" text DEFAULT 'gp' NOT NULL;--> statement-breakpoint
ALTER TABLE "message_threads" ADD COLUMN IF NOT EXISTS "service_category" text DEFAULT 'clinical' NOT NULL;--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "operating_clinics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"city" text NOT NULL,
	"address" text NOT NULL,
	"postcode" text NOT NULL,
	"phone" text NOT NULL,
	"accessibility_details" text NOT NULL,
	"directions" text NOT NULL,
	"arrival_instructions" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "menopause_assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"symptoms" jsonb NOT NULL,
	"hrt_history" text,
	"medical_history" text,
	"current_medications" text,
	"goals" text,
	"status" text DEFAULT 'submitted' NOT NULL,
	"reviewed_by_provider_id" uuid,
	"clinician_feedback" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "care_assessment_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"reference" text NOT NULL UNIQUE,
	"for_whom" text DEFAULT 'myself' NOT NULL,
	"recipient_name" text,
	"recipient_relationship" text,
	"authority_established" boolean DEFAULT false NOT NULL,
	"postcode" text NOT NULL,
	"support_requested" jsonb NOT NULL,
	"preferred_contact_method" text DEFAULT 'phone' NOT NULL,
	"preferred_contact_times" text,
	"accessibility_needs" text,
	"additional_notes" text,
	"status" text DEFAULT 'submitted' NOT NULL,
	"scheduled_assessment_at" timestamp with time zone,
	"responsible_team" text DEFAULT 'LifeCome Care Operations' NOT NULL,
	"next_action" text DEFAULT 'Our care coordinator will contact you to review your request and confirm assessment timing.' NOT NULL,
	"contact_route" text DEFAULT '+44 20 7946 0912 / care@lifecome.co.uk' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "care_arrangements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"request_id" uuid,
	"plan_reference" text NOT NULL UNIQUE,
	"named_provider" text DEFAULT 'LifeCome Care Services UK Ltd' NOT NULL,
	"service_type" text NOT NULL,
	"schedule_description" text NOT NULL,
	"charges_description" text NOT NULL,
	"funding_basis" text DEFAULT 'Self-funded' NOT NULL,
	"care_team_contact" text DEFAULT 'care-team@lifecome.co.uk' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"start_date" timestamp with time zone,
	"review_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "care_visits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"arrangement_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"care_worker_name" text NOT NULL,
	"service_type" text NOT NULL,
	"scheduled_starts_at" timestamp with time zone NOT NULL,
	"duration_minutes" integer DEFAULT 60 NOT NULL,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"address" text NOT NULL,
	"postcode" text NOT NULL,
	"notes" text,
	"urgent_contact_phone" text DEFAULT '+44 20 7946 0999' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "care_urgent_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"visit_id" uuid,
	"issue_type" text NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'reported' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "wellbeing_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"session_type" text NOT NULL,
	"title" text NOT NULL,
	"coach_name" text NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"duration_minutes" integer DEFAULT 45 NOT NULL,
	"status" text DEFAULT 'booked' NOT NULL,
	"meeting_link" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "shop_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sku" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"price_pence" integer NOT NULL,
	"stock_quantity" integer DEFAULT 100 NOT NULL,
	"ingredients" text,
	"usage_instructions" text,
	"warnings" text,
	"product_advice_link" text,
	"image_url" text,
	"is_prescription" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "shop_baskets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "shop_basket_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"basket_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "shop_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text NOT NULL UNIQUE,
	"patient_id" uuid NOT NULL,
	"subtotal_pence" integer NOT NULL,
	"delivery_pence" integer DEFAULT 0 NOT NULL,
	"total_pence" integer NOT NULL,
	"currency" text DEFAULT 'GBP' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"payment_status" text DEFAULT 'paid' NOT NULL,
	"payment_reference" text,
	"shipping_address" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "shop_order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"product_name" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price_pence" integer NOT NULL,
	"total_price_pence" integer NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "insurance_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"insurer_name" text NOT NULL,
	"distributor_details" text NOT NULL,
	"summary" text NOT NULL,
	"benefits" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"exclusions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"eligibility_criteria" text NOT NULL,
	"monthly_premium_estimate" text NOT NULL,
	"policy_document_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "insurance_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"provider_name" text NOT NULL,
	"policy_number" text NOT NULL,
	"policy_holder_name" text NOT NULL,
	"verification_status" text DEFAULT 'verification_pending' NOT NULL,
	"coverage_details" jsonb,
	"start_date" timestamp with time zone,
	"renewal_date" timestamp with time zone,
	"provider_contact_phone" text DEFAULT '+44 800 001 002' NOT NULL,
	"provider_contact_email" text DEFAULT 'support@insurance-provider.co.uk' NOT NULL,
	"claims_procedure" text DEFAULT 'Submit claims directly through provider portal or contact claims support line.' NOT NULL,
	"cancellation_route" text DEFAULT 'Contact provider directly at least 14 days prior to monthly renewal.' NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "insurance_cover_checks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"policy_id" uuid NOT NULL,
	"service_code" text NOT NULL,
	"service_name" text NOT NULL,
	"funding_status" text NOT NULL,
	"co_pay_amount" text,
	"pre_auth_required" boolean DEFAULT false NOT NULL,
	"notes" text,
	"checked_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "menopause_assessments" ADD CONSTRAINT "menopause_assessments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "care_assessment_requests" ADD CONSTRAINT "care_assessment_requests_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "care_arrangements" ADD CONSTRAINT "care_arrangements_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "care_visits" ADD CONSTRAINT "care_visits_arrangement_id_care_arrangements_id_fk" FOREIGN KEY ("arrangement_id") REFERENCES "public"."care_arrangements"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "care_visits" ADD CONSTRAINT "care_visits_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "care_urgent_reports" ADD CONSTRAINT "care_urgent_reports_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "wellbeing_sessions" ADD CONSTRAINT "wellbeing_sessions_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "shop_baskets" ADD CONSTRAINT "shop_baskets_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "shop_basket_items" ADD CONSTRAINT "shop_basket_items_basket_id_shop_baskets_id_fk" FOREIGN KEY ("basket_id") REFERENCES "public"."shop_baskets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "shop_basket_items" ADD CONSTRAINT "shop_basket_items_product_id_shop_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."shop_products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "shop_orders" ADD CONSTRAINT "shop_orders_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "shop_order_items" ADD CONSTRAINT "shop_order_items_order_id_shop_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."shop_orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "insurance_policies" ADD CONSTRAINT "insurance_policies_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "insurance_cover_checks" ADD CONSTRAINT "insurance_cover_checks_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "insurance_cover_checks" ADD CONSTRAINT "insurance_cover_checks_policy_id_insurance_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."insurance_policies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
