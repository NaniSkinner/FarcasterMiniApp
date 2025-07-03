CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"contract_address" varchar(42) NOT NULL,
	"event_signature" text NOT NULL,
	"event_args" jsonb NOT NULL,
	"next_timestamp" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
