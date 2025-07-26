import React, { useState, useEffect } from "react";
import { getGenieReply } from "../Genie"; // 🔁 Adjust the path if needed
import "./ChatScreen.css";

function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  // Initialize SpeechRecognition on mount
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in your browser.");
      return;
    }

    const recog = new SpeechRecognition();
    recog.lang = "en-US";
    recog.interimResults = false;
    recog.maxAlternatives = 1;

    setRecognition(recog);
  }, []);

  // Handle speech-to-text
  const startListening = () => {
    if (!recognition) return;
    setIsListening(true);
    recognition.start();

    recognition.onresult = async (event) => {
      setIsListening(false);
      const transcript = event.results[0][0].transcript;
      console.log("🎙️ You said:", transcript);

      const userMsg = {
        id: Date.now(),
        sender: "child",
        text: transcript,
      };
      setMessages((prev) => [...prev, userMsg]);

      // Get Genie's reply from Hugging Face
      const reply = await getGenieReply(transcript);

      const aiMsg = {
        id: Date.now() + 1,
        sender: "ai",
        text: reply,
      };
      setMessages((prev) => [...prev, aiMsg]);
    };

    recognition.onerror = (event) => {
      console.error("🎤 Speech recognition error:", event.error);
      setIsListening(false);
    };
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <header className="chat-header">
        <img src="/logo1.png" alt="Genie logo" className="chat-logo" />
        <h2>Free Chat Mode</h2>
      </header>

      {/* Chat Messages */}
      <main className="chat-body">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message ${msg.sender}`}>
            {msg.sender === "ai" && (
              <img src="/logo1.png" alt="Genie" className="chat-avatar" />
            )}
            <div className="chat-bubble">{msg.text}</div>
            {msg.sender === "child" && (
              <img
                src="https://i.pravatar.cc/40?img=11"
                alt="Child"
                className="chat-avatar"
              />
            )}
          </div>
        ))}
      </main>

      {/* Footer - Microphone */}
      <footer className="chat-footer">
        <button
          className={`mic-button ${isListening ? "pulse" : ""}`}
          onClick={startListening}
        >
          🎤 Speak
        </button>
      </footer>
    </div>
  );
}

export default ChatScreen;
