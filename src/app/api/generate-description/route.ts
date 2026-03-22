import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client using your secure environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(request: Request) {
  try {
    // 1. Extract the raw data sent from your frontend form
    const body = await request.json();
    const { jobTitle, description, achievements } = body;

    // 2. Select the Gemini model (gemini-1.5-flash is perfect for fast text tasks)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 3. Construct the prompt strictly following your PRD requirements
    const prompt = `
      You are an expert resume writer. Generate 3 to 5 ATS-optimized bullet points for a resume's Experience section.
      
      Target Job Title: ${jobTitle}
      Raw Responsibilities: ${description}
      Key Achievements: ${achievements ? achievements : "None provided"}
      
      Formatting Rules:
      - Emphasize measurable impact and use professional vocabulary.
      - Incorporate ATS-relevant keywords derived from the Job Title.
      - Output ONLY the bullet points, starting each line with a dash (-). Do not include any conversational filler or introductions.
    `;

    // 4. Call the API and format the response
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // 5. Send the generated text back to the frontend
    return NextResponse.json({ success: true, text: text });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate description" }, { status: 500 });
  }
}