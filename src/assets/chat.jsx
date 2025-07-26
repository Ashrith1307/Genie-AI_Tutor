// ChatScreen.jsx with OpenRouter (works immediately)
import React, { useState, useEffect, useRef } from "react";
import "./ChatScreen.css";

const fetchSarvamResponse = async (userMessage) => {
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SARVAM_API_URL}`, // Free key
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
        },
        body: JSON.stringify({
          model: "google/gemma-2-9b-it:free", // Free model
          messages: [
            {
              role: "system",
              content: `You are Genie AI Tutor, an expert English teaching assistant for students between age 6 to 16, responding in a friendly and supportive manner
                 Guidelines:
    - Use simple, clear language
    - Be encouraging and positive
    - Include emojis in responses
    - Keep answers short (1-3 sentences)
    - Ask follow-up questions to keep conversation going
    - Correct mistakes gently without making child feel bad
    - Focus on building confidence`,
            },
            { role: "user", content: userMessage },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("OpenRouter error:", error);
    return "I'm having trouble connecting. Please try again.";
  }
};

function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      console.log("🎙️ Listening...");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript.trim();
      if (!transcript) return;

      // Add user message
      const userMessage = {
        id: Date.now(),
        sender: "child",
        text: transcript,
      };
      setMessages((prev) => [...prev, userMessage]);

      // Get AI response
      const aiResponse = await fetchSarvamResponse(transcript);
      const aiMessage = {
        id: Date.now() + 1,
        sender: "ai",
        text: aiResponse,
      };
      setMessages((prev) => [...prev, aiMessage]);
    };

    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <img src="/logo192.png" alt="Genie Logo" className="chat-logo" />
        <h2>Genie Chat</h2>
      </div>

      <div className="chat-body">
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
            Click the microphone to start chatting! 🎤
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message ${msg.sender}`}>
            <div className="chat-avatar">
              {msg.sender === "ai" ? (
                <img src="/genie_avatar.png" alt="Genie" />
              ) : (
                <img src="/child_avatar.png" alt="You" />
              )}
            </div>
            <div className="chat-bubble">{msg.text}</div>
          </div>
        ))}
      </div>

      <div className="chat-footer">
        <button
          className={`mic-button ${isListening ? "pulse" : ""}`}
          onClick={startListening}
          disabled={isListening}
          title="Click to speak"
        >
          🎤
        </button>
      </div>
    </div>
  );
}

export default ChatScreen;
