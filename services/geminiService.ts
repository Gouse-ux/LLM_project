
import { GoogleGenAI, Type } from "@google/genai";
import { QueryResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set. Please make sure it's available.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        answer: {
            type: Type.STRING,
            description: "A comprehensive, clear, and helpful answer to the user's question, derived *exclusively* from the provided document text. Do not use any outside knowledge.",
        },
        source: {
            type: Type.STRING,
            description: "The exact, verbatim text segment from the document that was used to formulate the answer. This should be a direct quote.",
        },
    },
    required: ["answer", "source"],
};

export async function queryDocument(documentText: string, userQuery: string): Promise<QueryResult> {
    const model = "gemini-2.5-flash";
    const systemInstruction = `You are an expert document analysis assistant. Your task is to analyze the provided document text to answer the user's question. 
    - Your answer MUST be based solely on the information contained within the document.
    - Do not invent information or use external knowledge.
    - If the answer cannot be found in the document, state that clearly.
    - You must identify and return the specific text segment from the document that serves as the source for your answer.
    - Respond in valid JSON format according to the provided schema.`;

    const prompt = `DOCUMENT TEXT:
---
${documentText}
---

USER QUESTION: "${userQuery}"

Analyze the document and answer the question based on its content.`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.1, // Lower temperature for more factual, less creative answers
            },
        });
        
        const jsonText = response.text.trim();
        const parsedResult: QueryResult = JSON.parse(jsonText);

        // Basic validation
        if (!parsedResult.answer || typeof parsedResult.answer !== 'string' || !parsedResult.source || typeof parsedResult.source !== 'string') {
            throw new Error("Invalid JSON structure received from API.");
        }

        return parsedResult;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error && error.message.includes('JSON')) {
             throw new Error("Failed to parse the response from the AI. The model may have returned an invalid format.");
        }
        throw new Error("Failed to get a response from the AI service.");
    }
}
