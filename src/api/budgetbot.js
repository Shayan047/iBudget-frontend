import api from "./axios";

/**
 * Send a message to the BudgetBot backend.
 *
 * @param {string} message - The user's message
 * @param {Array} history - Array of { role: "user" | "assistant", content: string }
 * @returns {Promise<string>} - The assistant's reply
 *
 * When connecting LangChain:
 * - The backend endpoint should accept { message, history }
 * - It should return { reply: string }
 * - history is sent so LangChain can maintain context
 */
export const sendMessage = async (message, history) => {
  const response = await api.post("/budgetbot/chat", {
    message,
    history,
  });
  return response.data.reply;
};
