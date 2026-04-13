import { useState, useRef, useEffect } from "react";
import { sendMessage } from "../api/budgetbot";

const WELCOME_MESSAGE = {
  id: 1,
  role: "assistant",
  content:
    "Hi! I'm BudgetBot 👋 I can help you understand your spending, track your budget, and give you financial insights. What would you like to know?",
  timestamp: new Date(),
};

const formatTime = (date) => {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const BudgetBot = () => {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Build history array for API (excludes welcome message)
  const buildHistory = (msgs) =>
    msgs.filter((m) => m.id !== 1).map((m) => ({ role: m.role, content: m.content }));

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const history = buildHistory([...messages, userMessage]);
      const reply = await sendMessage(trimmed, history);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: reply,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "Sorry, I'm having trouble connecting right now. Please try again.",
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([WELCOME_MESSAGE]);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 72px)", // full height minus top padding
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "26px", fontWeight: "700" }}>BudgetBot</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
            Your AI-powered financial assistant
          </p>
        </div>
        <button
          onClick={handleClearChat}
          style={{
            background: "none",
            border: "1.5px solid var(--border)",
            borderRadius: "8px",
            padding: "8px 16px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "500",
            color: "var(--text-muted)",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--danger)";
            e.currentTarget.style.color = "var(--danger)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          Clear chat
        </button>
      </div>

      {/* Chat window */}
      <div
        className="card"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          padding: 0,
        }}
      >
        {/* Messages area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              {/* Bubble */}
              <div
                style={{
                  maxWidth: "70%",
                  padding: "12px 16px",
                  borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background:
                    msg.role === "user"
                      ? "var(--primary)"
                      : msg.isError
                        ? "#fef2f2"
                        : "var(--primary-bg)",
                  color:
                    msg.role === "user" ? "white" : msg.isError ? "var(--danger)" : "var(--text)",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  wordBreak: "break-word",
                }}
              >
                {msg.content}
              </div>

              {/* Timestamp */}
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  marginTop: "4px",
                  padding: "0 4px",
                }}
              >
                {formatTime(msg.timestamp)}
              </span>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div style={{ display: "flex", alignItems: "flex-start" }}>
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "18px 18px 18px 4px",
                  background: "var(--primary-bg)",
                  display: "flex",
                  gap: "4px",
                  alignItems: "center",
                }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      background: "var(--primary-light)",
                      animation: "bounce 1.2s infinite",
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "var(--border)" }} />

        {/* Input area */}
        <div
          style={{
            padding: "16px 24px",
            display: "flex",
            gap: "12px",
            alignItems: "flex-end",
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask BudgetBot anything about your finances..."
            rows={1}
            style={{
              flex: 1,
              resize: "none",
              border: "1.5px solid var(--border)",
              borderRadius: "10px",
              padding: "11px 14px",
              fontSize: "14px",
              fontFamily: "DM Sans, sans-serif",
              color: "var(--text)",
              outline: "none",
              transition: "border-color 0.2s",
              lineHeight: "1.5",
              maxHeight: "120px",
              overflowY: "auto",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--primary-light)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            onInput={(e) => {
              // Auto resize textarea
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="btn-primary"
            style={{
              padding: "11px 20px",
              opacity: !input.trim() || loading ? 0.5 : 1,
              cursor: !input.trim() || loading ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Send
          </button>
        </div>
      </div>

      {/* Bounce animation */}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
};

export default BudgetBot;
