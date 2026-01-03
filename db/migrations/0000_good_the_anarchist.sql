CREATE TABLE "kandang" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"initial_chicken_count" integer NOT NULL,
	"target_hdp_percent" real NOT NULL,
	"target_fcr" real NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recordings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kandang_id" uuid NOT NULL,
	"date" date NOT NULL,
	"feed_in_kg" real NOT NULL,
	"feed_remaining_kg" real NOT NULL,
	"feed_used_kg" real NOT NULL,
	"eggs_kg" real NOT NULL,
	"eggs_count" integer NOT NULL,
	"dead_chicken_count" integer NOT NULL,
	"notes" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"farm_name" text NOT NULL,
	"default_target_hdp_percent" real NOT NULL,
	"default_target_fcr" real NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recordings" ADD CONSTRAINT "recordings_kandang_id_kandang_id_fk" FOREIGN KEY ("kandang_id") REFERENCES "public"."kandang"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "recordings_kandang_date_unique" ON "recordings" USING btree ("kandang_id","date");