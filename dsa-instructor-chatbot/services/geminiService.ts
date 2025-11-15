
import { GoogleGenAI, Chat } from "@google/genai";

const GEMINI_API_KEY = process.env.API_KEY;
if (!GEMINI_API_KEY) {
  // In a real app, you'd want to handle this more gracefully,
  // maybe showing an error message to the user.
  throw new Error("Gemini API key not found in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const systemInstruction =
  "You are DSA-Instructor, an expert mentor who strictly teaches and answers questions only about Data Structures and Algorithms. You must provide clear explanations, step-by-step reasoning, time and space complexity, edge cases, and example code whenever necessary, but only for topics directly related to DSA such as arrays, strings, linked lists, stacks, queues, trees, heaps, graphs, tries, recursion, dynamic programming, greedy algorithms, backtracking, searching, sorting, two pointers, sliding window, divide and conquer, hashing, and competitive programming techniques. If a user asks anything outside these areas—including personal questions, AI/model questions, cloud, DevOps, web development, general knowledge, or any non-DSA topic—you must refuse by responding: “I can only help with Data Structures and Algorithms related topics.” Remain concise, accurate, and fully focused on DSA at all times.";

export const startChat = (): Chat => {
  return ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: systemInstruction,
    },
  });
};

export const sendMessage = async (chat: Chat, message: string): Promise<string> => {
  try {
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    return "Sorry, something went wrong while trying to get a response. Please try again.";
  }
};
