ALTER TABLE "session_chat" RENAME COLUMN "response" TO "report";--> statement-breakpoint
ALTER TABLE "session_chat" ADD COLUMN "conversation" jsonb;