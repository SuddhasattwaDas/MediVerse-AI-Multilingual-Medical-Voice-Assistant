import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "../../config/db";
import { usersTable, SessionChatTable } from "../../config/schema";

/**
 * Handles POST requests. It finds an existing user or creates a new one upon login.
 * This ensures every authenticated user has a corresponding record in your database.
 */
export async function POST(req: NextRequest) {
    const user = await currentUser();

    // 1. Authenticate the user
    if (!user || !user.primaryEmailAddress) {
        return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }
    
    const userEmail = user.primaryEmailAddress.emailAddress;

    try {
        // 2. Check if the user already exists in the database
        const existingUsers = await db.select()
            .from(usersTable)
            .where(eq(usersTable.email, userEmail));

        // 3. ✅ FIX: If user is found, return their data immediately
        if (existingUsers.length > 0) {
            return NextResponse.json(existingUsers[0]);
        }

        // 4. If not found, create a new user record
        const newUser = await db.insert(usersTable).values({
            name: user.firstName || "User",
            email: userEmail,
            credits: 10, // Default starting credits for a new user
        }).returning();

        return NextResponse.json(newUser[0]);

    } catch (e) {
        console.error("Database operation failed in POST /api/users:", e);
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }
}


/**
 * Handles GET requests to securely fetch the chat history for a specific session.
 */
export async function GET(req: NextRequest) {
    const user = await currentUser();

    // 1. Authenticate the user first
    if (!user || !user.primaryEmailAddress) {
        return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    // 2. Validate that sessionId is provided
    if (!sessionId) {
        return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    // 3. Wrap database logic in a try...catch block
    try {
        const chatHistory = await db.select()
            .from(SessionChatTable)
            .where(eq(SessionChatTable.sessionId, sessionId));

        // 4. FIX: Handle the "Not Found" case
        if (chatHistory.length === 0) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        // 5. FIX: Add a crucial security check for authorization
        // Ensure the user requesting the chat history is the one who owns it.
        if (chatHistory[0].userEmail !== user.primaryEmailAddress.emailAddress) {
            return NextResponse.json({ error: "Unauthorized access to session" }, { status: 403 });
        }

        return NextResponse.json(chatHistory);

    } catch (e) {
        console.error("Database operation failed in GET /api/users:", e);
        return NextResponse.json({ error: "Failed to fetch session data" }, { status: 500 });
    }
}