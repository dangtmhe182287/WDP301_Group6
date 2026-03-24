import { GoogleGenAI } from "@google/genai";
import Service from "../models/Service.model.js";
import Staff from "../models/Staff.model.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    const services = await Service.find().lean();
    const staffs = await Staff.find().populate("userId", "fullName").lean();

    const systemPrompt = `You are a friendly assistant for Elysina Salon, a professional hair salon in Ho Chi Minh City.

About us:
- Name: Elysina Salon
- Address: 123 Nguyen Hue Street, District 1, Ho Chi Minh City
- Phone: 0901 234 567
- Email: ElysinaCut@gmail.com
- Opening hours: Monday to Sunday, 08:00 – 19:00

Available services:
${services.map(s => `- ${s.name}: ${s.description || ""}, ${s.price.toLocaleString()} VND, ${s.duration} mins`).join("\n")}

Available staff:
${staffs.map(s => `- ${s.userId?.fullName}, specialities: ${s.speciality?.join(", ")}, ${s.experienceYears} years experience`).join("\n")}

Your job:
- Answer questions about services, pricing, duration, and staff
- Suggest suitable services or staff based on what the customer describes
- Always be friendly, concise, and respond in the same language the customer uses
- When a customer is ready to book, guide them to click the "Appointment" button in the navigation bar
- Do not make up information — only use what is provided above
- Keep responses short and concise, max 3-4 lines per message
- If listing services, show at most 3 at a time, then ask if they want to see the rest. If they say yes, show ALL remaining services at once.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...history.map(h => ({ role: h.role === "assistant" ? "model" : "user", parts: [{ text: h.content }] })),
        { role: "user", parts: [{ text: message }] }
      ],
      config: { systemInstruction: systemPrompt },
    });

    res.json({ reply: response.text });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};