ALTER TABLE "otp_challenges" ALTER COLUMN "purpose" SET DEFAULT 'email_verification';--> statement-breakpoint
ALTER TABLE "user_accounts" ALTER COLUMN "phone_number" DROP NOT NULL;--> statement-breakpoint
DELETE FROM "user_accounts" WHERE "email" IS NULL;--> statement-breakpoint
ALTER TABLE "user_accounts" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_accounts" ADD COLUMN "email_verified_at" timestamp with time zone;--> statement-breakpoint
CREATE UNIQUE INDEX "user_accounts_email_idx" ON "user_accounts" USING btree ("email");