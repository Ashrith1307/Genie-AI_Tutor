import React, { useState } from "react";
import "./ChatScreen.css";

function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);

  // 1. Set up SpeechRecognition
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  const startListening = () => {
    setIsListening(true);
    recognition.start();
    console.log("Listening...");
  };
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;

    // Add child message
    const newChildMessage = {
      id: Date.now(),
      sender: "child",
      text: transcript,
    };

    setMessages((prev) => [...prev, newChildMessage]);

    // Auto Genie reply after 1 second
    setTimeout(() => {
      const genieReply = {
        id: Date.now() + 1,
        sender: "ai",
        text: "That's interesting! Tell me more 😊",
      };
      setMessages((prev) => [...prev, genieReply]);
    }, 1000);
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
  };

  // const messages = [
  //   { id: 1, sender: "ai", text: "Hello! I am Genie, your English buddy." },
  //   { id: 2, sender: "child", text: "Hi Genie! Can we talk about animals?" },
  //   { id: 3, sender: "ai", text: "Sure! What is your favorite animal?" },
  //   { id: 4, sender: "child", text: "I love elephants!" },
  // ];

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h2>Free Chat Mode</h2>
      </header>

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
          onClick={startListening}
          aria-label="Microphone"
        >
          🎤
        </button>
      </footer>
    </div>
  );
}

export default ChatScreen;
