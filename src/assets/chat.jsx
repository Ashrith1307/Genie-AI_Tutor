import React, { useState } from "react";
import "./ChatScreen.css";

function ChatScreen() {
  const [isListening, setIsListening] = useState(false);

  const messages = [
    { id: 1, sender: "ai", text: "Hello! I am Genie, your English buddy." },
    { id: 2, sender: "child", text: "Hi Genie! Can we talk about animals?" },
    { id: 3, sender: "ai", text: "Sure! What is your favorite animal?" },
    { id: 4, sender: "child", text: "I love elephants!" },
  ];

  const toggleListening = () => setIsListening(!isListening);

  return (
    <div className="chat-container">
      {/* Header */}
      <header className="chat-header">
        <img src="public/logo1.png" alt="Genie logo" className="chat-logo" />
        <h2>Free Chat Mode</h2>
      </header>

      {/* Chat Area */}
      <main className="chat-body">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message ${msg.sender}`}>
            {msg.sender === "ai" && (
              <img
                src="public/logo1.png"
                alt="AI avatar"
                className="chat-avatar"
              />
            )}
            <div className="chat-bubble">{msg.text}</div>
            {msg.sender === "child" && (
              <img
                src="https://i.pravatar.cc/40?img=11"
                alt="Child avatar"
                className="chat-avatar"
              />
            )}
          </div>
        ))}
      </main>

      {/* Microphone Button */}
      <footer className="chat-footer">
        <button
          className={`mic-button ${isListening ? "pulse" : ""}`}
          onClick={toggleListening}
          aria-label="Microphone"
        >
          🎤
        </button>
      </footer>
    </div>
  );
}

export default ChatScreen;
