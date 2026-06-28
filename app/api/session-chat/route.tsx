import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { eq, desc, and } from "drizzle-orm"; // Import all required Drizzle operators
import { db } from "../../config/db"; // Assuming db config is here
import { SessionChatTable } from "../../config/schema"; // Assuming schema is here

// Define the shape of the selectedDoctor object expected in the request
interface SelectedDoctor {
    id: number;
    specialist: string;
    description: string;
    image: string;
    agentPrompt?: string;
    voiceId?: string;
}

// Define the shape of the incoming request body for POST
interface NewSessionRequest {
    note: string;
    selectedDoctor: SelectedDoctor;
}

// --- Create a new session ---
export async function POST(req: NextRequest) {
    const user = await currentUser();
    if (!user || !user.primaryEmailAddress) {
        return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    try {
        const body: NewSessionRequest = await req.json();
        const { note, selectedDoctor } = body;

        if (!note?.trim() || !selectedDoctor) {
            return NextResponse.json(
                { error: "Missing required fields: note and selectedDoctor" },
                { status: 400 }
            );
        }

        const createdBy = user.primaryEmailAddress.emailAddress; 
        const sessionId = `session_${Date.now()}_${user.id.slice(-6)}`;

        // Insert new session using updated schema column names
        const newSession = await db.insert(SessionChatTable).values({
                sessionId,
                userEmail: createdBy, 
                note: note,           
                selectedDoctor,
                conversation: null, // Initialize as null
                report: null,       // Initialize as null
            })
            .returning({ sessionId: SessionChatTable.sessionId }); 

        if (!newSession || newSession.length === 0) {
            throw new Error("Failed to create session in database.");
        }

        return NextResponse.json({ sessionId: newSession[0].sessionId }, { status: 201 });
    } catch (err) {
        console.error("Failed to create new session:", err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: "Internal Server Error", details: errorMessage }, { status: 500 });
    }
}

// --- Get session details (for one session OR all sessions) ---
export async function GET(req: NextRequest) {
    const user = await currentUser();
    if (!user || !user.primaryEmailAddress) {
        return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get("sessionId");

        if (!sessionId) {
            return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
        }

        // --- Handle the 'all' case for fetching history list ---
        if (sessionId === 'all') {
            const allSessions = await db
                .select()
                .from(SessionChatTable)
                .where(eq(SessionChatTable.userEmail, user.primaryEmailAddress.emailAddress))
                .orderBy(desc(SessionChatTable.createdOn)); // Order by creation date
            
            return NextResponse.json(allSessions, { status: 200 });
        }

        // --- Logic for fetching a *single* session by its ID ---
        const sessions = await db
            .select()
            .from(SessionChatTable)
            .where(eq(SessionChatTable.sessionId, sessionId))
            .limit(1); 

        if (!sessions.length) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        const session = sessions[0];

        // Authorize: Check if the session belongs to the current user
        if (session.userEmail !== user.primaryEmailAddress.emailAddress) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        return NextResponse.json(session, { status: 200 });
    } catch (err) {
        console.error("Failed to fetch session(s):", err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: "Internal Server Error", details: errorMessage }, { status: 500 });
    }
}

// --- Update session conversation ---
export async function PUT(req: NextRequest) {
  const user = await currentUser();
  if (!user || !user.primaryEmailAddress) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const { sessionId, conversation } = await req.json();

    if (!sessionId || !conversation) {
      return NextResponse.json({ error: "Missing sessionId or conversation data" }, { status: 400 });
    }

    // Update the conversation in the database, checking for user ownership
    const result = await db.update(SessionChatTable)
      .set({ conversation: conversation })
      .where(
        and( // Security check: Ensure user owns this session
          eq(SessionChatTable.sessionId, sessionId),
          eq(SessionChatTable.userEmail, user.primaryEmailAddress.emailAddress)
        )
      )
      .returning({ updatedId: SessionChatTable.id });

    if (result.length === 0) {
      console.warn(`(PUT) No session found for user ${user.primaryEmailAddress.emailAddress} with sessionId: ${sessionId} to update conversation.`);
      return NextResponse.json({ error: "Session not found or user unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ message: "Conversation updated successfully" }, { status: 200 });

  } catch (err) {
    console.error("Failed to update conversation:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


// --- Delete a session ---
export async function DELETE(req: NextRequest) {
  const user = await currentUser();
  if (!user || !user.primaryEmailAddress) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    // Delete the session *only* if it matches the sessionId AND the logged-in user's email
    const result = await db.delete(SessionChatTable)
      .where(
        and(
          eq(SessionChatTable.sessionId, sessionId),
          eq(SessionChatTable.userEmail, user.primaryEmailAddress.emailAddress)
        )
      )
      .returning({ deletedId: SessionChatTable.id });

    if (result.length === 0) {
      // This could be because the session doesn't exist OR it belongs to another user
      console.warn(`(DELETE) No session found for user ${user.primaryEmailAddress.emailAddress} with sessionId: ${sessionId}`);
      return NextResponse.json({ error: "Session not found or user unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ message: "Session deleted successfully" }, { status: 200 });

  } catch (err) {
    console.error("Failed to delete session:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}