import { InferenceClient } from "@huggingface/inference";

const SYSTEM_PROMPT = `
You are a friendly AI Genie who chats with children to improve their English speaking skills. Keep your tone playful, simple, and engaging. Answer like a buddy, not a robot.
`;

const hf = new InferenceClient(import.meta.env.VITE_HF_API_KEY); // store key in .env

export async function getGenieReply(childMessage) {
  try {
    const response = await hf.chatCompletion({
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: childMessage },
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error("❌ Hugging Face Error:", err.message);
    return "Oops! Genie needs a nap. Try again!";
  }
}
