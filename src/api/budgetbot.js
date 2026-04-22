import api from "./axios";

/**
 * Send a message to BudgetBot.
 *
 * @param {string} message - The user's message
 * @param {string} sessionId - UUID generated on component mount, identifies the Redis session
 * @returns {Promise<string>} - The assistant's reply
 *
 * Backend endpoint: POST /budgetbot/chat
 * Request:  { query: string, session_id: string }
 * Response: { reply: string }
 *
 * History is managed server-side in Redis using session_id as the key.
 * Frontend does NOT send history — Redis handles context automatically.
 */
export const sendMessage = async (message, sessionId) => {
  const response = await api.post("/budgetbot/chat", {
    query: message,
    session_id: sessionId,
  });
  return response.data.reply;
};
