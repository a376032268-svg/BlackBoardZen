import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeChalkboard(base64Image: string, promptText: string): Promise<string> {
  try {
    // Clean base64 string if it has headers
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
            {
                inlineData: {
                    mimeType: 'image/png',
                    data: cleanBase64
                }
            },
            {
                text: promptText
            }
        ]
      },
      config: {
          systemInstruction: "You are a friendly and helpful teacher using a digital blackboard. Keep your answers concise, encouraging, and formatted with Markdown."
      }
    });

    return response.text || 'Thinking...';
  } catch (error) {
    console.error('Gemini Error:', error);
    return 'Sorry, I could not analyze the board at this moment. Please check your network.';
  }
}