// ChatScreen.jsx - CORRECTED version with proper function structure
import React, { useState, useEffect, useRef } from "react";
import "./ChatScreen.css";

// AI response function with child-friendly prompting
const fetchSarvamResponse = async (userMessage) => {
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SARVAM_API_URL}`, // Your OpenRouter API key
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
        },
        body: JSON.stringify({
          model: "google/gemma-2-9b-it:free", // Free model
          messages: [
            {
              role: "system",
              content: `You are Genie AI Tutor, an expert English teaching assistant for students between age 6 to 16, responding in a friendly and supportive manner.

Guidelines:
- Use simple, clear language
- Be encouraging and positive  
- Include emojis in responses
- Keep answers short (1-3 sentences)
- Ask follow-up questions to keep conversation going
- Correct mistakes gently without making child feel bad
- Focus on building confidence
- Act like a magical helpful genie who loves teaching
- don't directly jump into another topic, instead ask follow-up questions to keep the conversation going and give examples 
- Use only common punctuation marks like . , ? ! and avoid using any special characters or formatting in your responses.
- don't use the punctuation marks like ** , _ , or any other special characters
- Talk only about the English language and its related topics, like grammar, vocabulary, writing, reading, etc.
- Avoid discussing unrelated topics like math, science, etc.
- you are not google deepmind ai
- You are Genie AI Tutor
- You are a friendly and helpful AI tutor for children, not a general-purpose AI.
- Don't deviate from the topic of English language learning.
- Don't deviate from the current conversation topic until the user changes it.
- if the user asks about something unrelated to English language learning, gently steer the conversation back to English topics.
- if the user asks for the meaning of a word, provide a simple definition and an example sentence.
- if the user asks for the examples, provide the examples of ongoing conversation
- if the user asks for the synonyms, provide the synonyms of ongoing conversation
- always introduce yourself at the start of the conversation as "Genie AI Tutor" and explain that you are here to help them learn English in a fun and engaging way.
- if the user replies with "proceed" or "continue", continue the conversation without repeating the introduction.
- don't repeat the introduction if the user has already acknowledged it.
- if you don't understand the user's message, ask them to rephrase it or provide more context.
`,
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
    return "I'm having trouble connecting right now. Please try again later! ✨";
  }
}; // ✅ Fixed: Added missing closing brace

const removeEmojisFromText = (text) => {
  // Comprehensive emoji regex pattern that covers all Unicode emoji ranges
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]|[\u{FE00}-\u{FE0F}]|[\u{1F200}-\u{1F2FF}]|[\u{E000}-\u{F8FF}]|[\u{2000}-\u{206F}]|[\u{FFF0}-\u{FFFF}]/gu;

  return text
    .replace(emojiRegex, "") // Remove all emojis
    .replace(/\s+/g, " ") // Clean up extra spaces
    .replace(/^\s+|\s+$/g, "") // Remove leading/trailing spaces
    .trim(); // Final trim for safety
};
// OUTSIDE of fetchSarvamResponse
// TTS Configuration for child-friendly voice
const configureTTSForChildren = (utterance) => {
  // Child-friendly settings
  utterance.rate = 0.8; // Slower speaking rate for better comprehension
  utterance.pitch = 1.3; // Higher pitch for friendlier, child-like tone
  utterance.volume = 0.9; // Slightly softer volume

  // Try to find a female or child-friendly voice
  const voices = speechSynthesis.getVoices();

  // Priority order for child-friendly voices
  const preferredVoices = [
    /Google US English Female/i,
    /Microsoft Zira/i, // Female voice on Windows
    /Samantha/i, // macOS female voice
    /Fiona/i, // macOS female voice
    /Victoria/i, // macOS female voice
    /female/i, // Any voice with "female" in name
    /woman/i, // Any voice with "woman" in name
    /.*/, // Fallback to any voice
  ];

  // Find the best available voice
  let selectedVoice = null;
  for (const pattern of preferredVoices) {
    selectedVoice = voices.find(
      (voice) => pattern.test(voice.name) && voice.lang.startsWith("en")
    );
    if (selectedVoice) {
      console.log(`🎭 Selected voice: ${selectedVoice.name}`);
      break;
    }
  }

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  return utterance;
};

// TTS Function with Child-Friendly Configuration
// TTS Function with Child-Friendly Configuration + Emoji Filtering
const speakText = (text, onStart, onEnd, onError) => {
  if (!("speechSynthesis" in window)) {
    console.warn("Speech synthesis not supported");
    onError && onError("Speech synthesis not supported");
    return;
  }

  // Stop any ongoing speech
  speechSynthesis.cancel();

  // 🚫 FILTER OUT EMOJIS before speaking
  const cleanText = removeEmojisFromText(text);

  // Don't speak if text is empty after emoji removal
  if (!cleanText.trim()) {
    console.log("⚠️ Text is empty after emoji removal, skipping speech");
    onEnd && onEnd();
    return;
  }

  // Debug logging to see the📝 Original text:", text);
  console.log("🧹 Clean text for TTS:", cleanText);

  const utterance = new SpeechSynthesisUtterance(cleanText); // Use cleaned text

  // Apply child-friendly configuration
  configureTTSForChildren(utterance);

  // Event handlers
  utterance.onstart = () => {
    console.log("🔊 Genie started speaking:", cleanText);
    onStart && onStart();
  };

  utterance.onend = () => {
    console.log("🔇 Genie finished speaking");
    onEnd && onEnd();
  };

  utterance.onerror = (event) => {
    console.error("🔊 TTS Error:", event.error);
    onError && onError(event.error);
  };

  // Speak the cleaned text (no emojis)
  speechSynthesis.speak(utterance);
};

// ✅ Fixed: Main component function structure
function ChatScreen({ onBack }) {
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // TTS state
  const recognitionRef = useRef(null);

  // Load voices when component mounts
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        console.log(
          "🎭 Available voices:",
          voices.map((v) => v.name)
        );
      }
    };

    // Load voices immediately if available
    loadVoices();

    // Handle voices loading asynchronously
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      // Cleanup: stop any ongoing speech
      speechSynthesis.cancel();
    };
  }, []);

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
      console.log("🎙️ Listening started...");
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log("🎙️ Listening ended.");
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript.trim();
      if (!transcript) return;

      console.log("👤 You said:", transcript);

      // Add user message
      const newUserMessage = {
        id: Date.now(),
        sender: "child",
        text: transcript,
      };
      setMessages((prev) => [...prev, newUserMessage]);

      // Get AI response
      const aiText = await fetchSarvamResponse(transcript);
      const aiMessage = {
        id: Date.now() + 1,
        sender: "ai",
        text: aiText,
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Speak the AI response with child-friendly voice
      speakText(
        aiText,
        () => setIsSpeaking(true), // onStart
        () => setIsSpeaking(false), // onEnd
        (error) => {
          console.error("TTS Error:", error);
          setIsSpeaking(false);
        }
      );
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);

      // User-friendly error messages
      const errorMessages = {
        "no-speech": "I didn't hear anything. Please try speaking again! 🎤",
        network: "Check your internet connection and try again! 🌐",
        "not-allowed": "Please allow microphone access to use voice chat! 🎤",
      };

      const userFriendlyMessage =
        errorMessages[event.error] ||
        "Something went wrong. Let's try again! 😊";

      // Show error message to user
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: "system",
          text: userFriendlyMessage,
        },
      ]);
    };

    recognitionRef.current = recognition;
  }, []);

  const startListening = () => {
    // Prevent listening while AI is speaking
    if (recognitionRef.current && !isListening && !isSpeaking) {
      recognitionRef.current.start();
    }
  };

  // Stop speaking function
  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        {onBack && (
          <button onClick={onBack} className="back-button">
            ← Back
          </button>
        )}
        <img src="/logo1.png" alt="Genie Logo" className="chat-logo" />
        <h2>Genie Chat</h2>

        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="speaking-indicator">
            <span className="speaking-icon">🔊</span>
            <span>Genie is speaking...</span>
            <button onClick={stopSpeaking} className="stop-speaking-btn">
              Stop
            </button>
          </div>
        )}
      </div>

      <div className="chat-body">
        {messages.length === 0 && (
          <div className="welcome-message">
            <div className="genie-welcome">
              <img src="/logo1.png" alt="Genie Logo" className="chat-logo" />
              <h3>Hello! I'm your friendly Genie tutor! ✨</h3>
              <p>Click the microphone and ask me anything!</p>
              <p>
                <small>💡 I'll speak back to you with a friendly voice!</small>
              </p>
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message ${msg.sender}`}>
            <div className="chat-avatar">
              {msg.sender === "ai" ? (
                <img src="/logo1.png" alt="Genie Logo" className="chat-logo" />
              ) : msg.sender === "system" ? (
                <span className="system-avatar">⚠️</span>
              ) : (
                <img src="/logo2.png" alt="child Logo" className="chat-logo" />
              )}
            </div>
            <div className="chat-bubble">
              {msg.text}
              {/* Replay button for AI messages */}
              {msg.sender === "ai" && (
                <button
                  className="replay-btn"
                  onClick={() =>
                    speakText(
                      msg.text,
                      () => setIsSpeaking(true),
                      () => setIsSpeaking(false)
                    )
                  }
                  disabled={isSpeaking}
                  title="Replay this message"
                >
                  <img src="/replay.png" alt="Replay" className="replay-logo" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="chat-footer">
        <button
          className={`mic-button ${isListening ? "listening" : ""} ${
            isSpeaking ? "disabled" : ""
          }`}
          onClick={startListening}
          disabled={isListening || isSpeaking}
          title={
            isSpeaking
              ? "Wait for Genie to finish speaking..."
              : isListening
              ? "Listening..."
              : "Click to speak"
          }
        >
          {isListening ? "🎙️" : isSpeaking ? "🔊" : "🎤"}
        </button>

        {/* Status text */}
        {/* <div className="status-text">
          {isSpeaking
            ? "🧞 Genie is speaking..."
            : isListening
            ? "🎙️ Listening..."
            : "🎤 Tap to talk with Genie"}
        </div> */}
      </div>
    </div>
  );
}

export default ChatScreen;
