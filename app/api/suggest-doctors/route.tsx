import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { currentUser } from '@clerk/nextjs/server';

// ✅ 1. Import the correct, complete list of doctors
// (Assuming your list.tsx file is at '@/shared/list')
import { AIDoctorAgents } from '@/shared/list'; 

// Use the imported list as the master list
const allDoctorAgents = AIDoctorAgents;

// Initialize the Google Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
    try {
        // --- Authentication ---
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
        }

        const body = await request.json();
        const { note } = body as { note: string };

        if (!note) {
            return NextResponse.json({ error: 'Note is required' }, { status: 400 });
        }

        // --- 1. Prompt Engineering ---
        const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash-lite" }); // Correct model name
        
        const specialistList = allDoctorAgents.map(d => d.specialist).join(', ');

        const prompt = `You are an expert medical classification and routing AI.

**Core Task:** Analyze the **User Note** and determine if it describes a medical symptom.

**Available Specialists:**
[${specialistList}]

**User Note:**
"${note}"

**Rules:**
1.  **Analyze:** First, determine if the **User Note** describes a recognizable medical symptom or health concern (e..g., "chest pain", "headache", "feeling sad", "skin rash").
2.  **Medical Case:** If the note IS a medical concern, identify up to three of the most relevant specialists from the **Available Specialists** list. Return your answer as a JSON array of strings.
3.  **Non-Medical Case:** If the note is NOT a medical concern (e.g., "CAR", "Pencil", "hello", "I need a new computer"), you MUST return an empty JSON array \`[]\`.
4.  **Output Format:** Your response MUST be *only* the valid JSON array and nothing else. Do not add any explanatory text, apologies, or preambles like "Here is the JSON:".

**Examples:**

* **Input Note:** "I have a sharp pain in my chest."
* **Output:** \`["Cardiologist", "General Physician"]\`

* **Input Note:** "Pencil"
* **Output:** \`[]\`

* **Input Note:** "skin rash on my arm"
* **Output:** \`["Dermatologist"]\`

* **Input Note:** "hello how are you"
* **Output:** \`[]\`

Generate your response now.`;

        // --- 2. Call the Gemini API ---
        const result = await model.generateContent(prompt);

        // --- 3. Safely extract text from response ---
        let text = "";
        try {
            text = result.response.text();
        } catch (e) {
            console.error("Failed to extract text from Gemini response:", e);
            throw new Error("Invalid response from AI model.");
        }

        text = text.replace(/```json|```/g, "").trim();
        console.log("Gemini API Text:", text);

        // --- 4. Parse AI response safely (with improved logic) ---
        let suggestedSpecialistNames: string[] = [];
        let parsingSuccessful = false; // Flag to track if AI response was valid JSON
        try {
            const parsedData = JSON.parse(text);
            if (Array.isArray(parsedData)) {
                suggestedSpecialistNames = parsedData;
                parsingSuccessful = true; // Success! AI returned a valid array (even if empty)
            }
        } catch (e) {
            console.error("Failed to parse JSON from Gemini response:", e);
            // parsingSuccessful remains false
        }

        // --- 5. Map names to full doctor objects & handle fallback ---
        let suggestedDoctors = allDoctorAgents.filter(doctor =>
            suggestedSpecialistNames.includes(doctor.specialist)
        );

        // --- ✅ FIX: Corrected Fallback Logic ---
        // We only apply the fallback *if* parsing failed AND the list is empty.
        // If parsing was successful (even with an empty "[]" array), we do NOT apply the fallback.
        if (!parsingSuccessful && suggestedDoctors.length === 0) {
            console.log("Parsing failed, applying fallback...");
            const fallbackDoctor = allDoctorAgents.find(d => d.specialist === "General Physician");
            suggestedDoctors = fallbackDoctor ? [fallbackDoctor] : [];
        }

        return NextResponse.json(suggestedDoctors, { status: 200 });

    } catch (error) {
        console.error("Error in /api/suggest-doctors:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}