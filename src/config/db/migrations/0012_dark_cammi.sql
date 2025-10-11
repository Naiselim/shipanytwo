ALTER TABLE "order" ALTER COLUMN "plan_name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "plan_name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "billing_url" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "payment_product_id" text;