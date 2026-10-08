ALTER TABLE "otp_challenges" ALTER COLUMN "purpose" SET DEFAULT 'phone_verification';--> statement-breakpoint
ALTER TABLE "user_accounts" ADD COLUMN "first_name" text;--> statement-breakpoint
ALTER TABLE "user_accounts" ADD COLUMN "last_name" text;