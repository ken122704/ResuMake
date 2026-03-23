import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize the Gemini SDK with your private API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { prompt, section } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // We use the 2.5-flash model because it is incredibly fast for text tasks
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // The system instruction turns Gemini into an expert resume writer
    const systemInstruction = `You are an expert resume writer. The user will give you rough notes about their ${section}. 
    Rewrite it into 2 to 3 professional, ATS-optimized bullet points using strong action verbs. 
    Format the output as a clean text list with bullet points. Do not include any introductory or concluding text, just the bullet points.`;

    const result = await model.generateContent(`${systemInstruction}\n\nUser input: ${prompt}`);
    const text = result.response.text();

    return NextResponse.json({ text });
  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate description" }, { status: 500 });
  }
}