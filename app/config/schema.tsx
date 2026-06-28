import { integer, pgTable, varchar, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";

// Shared type for doctor
type DoctorAgent = {
  id: number;
  specialist: string;
  description: string;
  image: string;
  agentPrompt?: string;
  voiceId?: string;
};

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 320 }).notNull().unique(),
  credits: integer(),
});

export const SessionChatTable = pgTable("session_chat", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  sessionId: varchar({ length: 255 }).notNull(),
  
 userEmail: varchar({ length: 320 }).notNull(), 
  
  note: text().notNull(), 
  
  conversation: jsonb("conversation"), 
  
  report: jsonb("report"), 
  
  selectedDoctor: jsonb("selected_doctor").$type<DoctorAgent>().notNull(),
  createdOn: timestamp({ withTimezone: true }).defaultNow(),

}, (table) => ({
  sessionIdx: index("session_id_idx").on(table.sessionId),
}));
