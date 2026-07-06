import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const extractMeterReading = async (base64Image, mimeType) => {
  const prompt = `Look at this utility meter photo. Return ONLY raw JSON, no markdown, no explanation, in this exact shape:
{"reading": <number>, "confidence": "high" or "low", "issue": "<glare, blur, angle, or none>"}
If the display has red or decimal digits after the black digits, ignore them and return only the black whole number digits.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: [prompt, { inlineData: { data: base64Image, mimeType } }],
  });

  const cleaned = response.text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
};

export default extractMeterReading;