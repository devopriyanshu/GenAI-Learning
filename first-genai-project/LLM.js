import { GoogleGenAI } from "@google/genai";
import readlineSync from "readline-sync";
import dotenv from "dotenv";
dotenv.config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const history = [];
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function Chatting(userText) {
  history.push({
    role: "user",
    parts: [{ text: userText }],
  });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: history,
  });
  history.push({
    role: "model",
    parts: [{ text: response.text }],
  });
  console.log(response.text);
}
async function main() {
  const userText = readlineSync.question("Ask me anything?-- ");
  await Chatting(userText);
  main();
}

main();
