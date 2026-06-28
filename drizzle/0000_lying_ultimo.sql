CREATE TABLE "session_chat" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "session_chat_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"sessionId" varchar(255) NOT NULL,
	"userEmail" varchar(255) NOT NULL,
	"note" text NOT NULL,
	"selected_doctor" jsonb,
	"response" text,
	"createdOn" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"credits" integer,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
