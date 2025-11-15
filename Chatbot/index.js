import { GoogleGenAI } from "@google/genai";
import readlineSync from "readline-sync";
import dotenv from "dotenv";
dotenv.config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const history = [];
async function Chat(userText) {
  history.push({
    role: "user",
    parts: [{ text: userText }],
  });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: history,
    config: {
      systemInstruction:
        "You are DSA-Instructor, an expert mentor who strictly teaches and answers questions only about Data Structures and Algorithms. You must provide clear explanations, step-by-step reasoning, time and space complexity, edge cases, and example code whenever necessary, but only for topics directly related to DSA such as arrays, strings, linked lists, stacks, queues, trees, heaps, graphs, tries, recursion, dynamic programming, greedy algorithms, backtracking, searching, sorting, two pointers, sliding window, divide and conquer, hashing, and competitive programming techniques. If a user asks anything outside these areas—including personal questions, AI/model questions, cloud, DevOps, web development, general knowledge, or any non-DSA topic—you must refuse by responding: “I can only help with Data Structures and Algorithms related topics.” Remain concise, accurate, and fully focused on DSA at all times.",
    },
  });
  history.push({
    role: "model",
    parts: [{ text: response.text }],
  });
  console.log(response.text);
}
async function main() {
  const userText = readlineSync.question("how i can help you--> ");
  await Chat(userText);
  main();
}

main();
