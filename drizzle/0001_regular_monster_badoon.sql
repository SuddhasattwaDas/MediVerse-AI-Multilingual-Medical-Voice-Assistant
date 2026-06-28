ALTER TABLE "session_chat" ALTER COLUMN "userEmail" SET DATA TYPE varchar(320);--> statement-breakpoint
ALTER TABLE "session_chat" ALTER COLUMN "selected_doctor" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE varchar(320);--> statement-breakpoint
CREATE INDEX "session_id_idx" ON "session_chat" USING btree ("sessionId");