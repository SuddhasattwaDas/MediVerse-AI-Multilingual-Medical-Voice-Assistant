import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SessionChatTable } from "@/app/config/schema";
import { db } from "@/app/config/db"; // <-- FIX: Added db import
import { eq } from "drizzle-orm"; // <-- FIX: Added eq import

// Initialize the Google Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
    const { sessionId, messages, sessionDetail } = await request.json();

    // Basic validation
    if (!sessionId || !messages || !sessionDetail) {
        return NextResponse.json({ error: "Missing required fields: sessionId, messages, or sessionDetail" }, { status: 400 });
    }

    try {
        // --- 1. Prepare Data for Prompt ---
        // Convert the chat history (which uses {role, text}) into a readable string
        const conversationString = messages.map((msg: { role: string, text: string }) => 
            `${msg.role === 'user' ? 'Patient' : 'AI Assistant'}: ${msg.text}`
        ).join('\n');

        // --- 2. Create the AI Prompt ---
        const prompt = `
You are an expert medical report generator. Based on the following session details and conversation, generate a structured report in English, regardless of the conversation's original language.

Maintain the following order and JSON structure EXACTLY. Use the keys as written (with spaces if shown). Fill in "NA" if the information is not provided in the conversation.

1.  sessionId: ${sessionId}
2.  agent: ${sessionDetail.selectedDoctor.specialist}
3.  "Name of the patient": The patient's full name (NA if not provided).
4.  "Age": The patient's age (NA if not provided).
5.  "Sex": The patient's sex (NA if not provided).
6.  timestamp: ${sessionDetail.createdOn}
7.  chiefComplaint: A brief summary of the main health issue discussed.
8.  historyOfPresentIllness: Detailed account of the symptoms and issues presented by the patient during the conversation.
9.  symptoms: A detailed list of specific symptoms described by the patient.
10. duration: How long the patient has been experiencing the symptoms.
11. severity: The intensity or seriousness of the symptoms (e.g., mild, moderate, severe).
12. summary: A concise summary of the conversation, key symptoms, and any potential diagnoses or advice mentioned (2-3 sentences).
13. prescribedMedicines: A clear list of medicines prescribed with dosage and instructions, if any were mentioned.
14. "list of tests recommended": Any medical tests suggested during the conversation.
15. recommendations: Lifestyle changes, follow-up actions, or referrals mentioned.
16. closingNotes: Any final remarks or advice given at the end of the conversation.

Return the report in JSON format only, matching this structure EXACTLY:
{
    "sessionId": "string",
    "agent": "string",
    "Name of the patient": "string",
    "Age": "string",
    "Sex": "string",
    "timestamp": "string",
    "chiefComplaint": "string",
    "historyOfPresentIllness": "string",
    "symptoms": ["symptom1", "symptom2"],
    "duration": "string",
    "severity": "string",
    "summary": "string",
    "prescribedMedicines": ["medicine1: dosage and instructions"],
    "list of tests recommended": ["test1", "test2"],
    "recommendations": ["recommendation1", "recommendation2"],
    "closingNotes": "string"
}

--- DATA ---
[Session Details]:
${JSON.stringify(sessionDetail)}

[Conversation Transcript]:
${conversationString}
--- END DATA ---

Generate the JSON report now:
`;

        // --- 3. Call Gemini API ---
        const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash-lite" }); // <-- FIX: Correct model name
        const completion = await model.generateContent(prompt);

        // --- 4. Parse Response ---
        const rawResp = completion.response.text(); // <-- FIX: Correct response parsing
        const cleanResp = rawResp.replace(/```json|```/g, '').trim(); // Clean up markdown
        const JSONResp = JSON.parse(cleanResp);

        // --- 5. Save to Database ---
        // FIX: This must be an UPDATE, not an INSERT, and must be before the return
        const result = await db.update(SessionChatTable).set({
            report: JSONResp
        }).where(eq(SessionChatTable.sessionId, sessionId))
          .returning({ updatedId: SessionChatTable.id });

        if (result.length === 0) {
            console.warn(`No session found with sessionId: ${sessionId} to update report.`);
            // Note: We can still return the report even if DB update fails
        }

        // --- 6. Return JSON Report ---
        return NextResponse.json(JSONResp, { status: 200 });

    } catch (e) {
        console.error("Error generating or saving report:", e);
        // FIX: Return a proper error response
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}