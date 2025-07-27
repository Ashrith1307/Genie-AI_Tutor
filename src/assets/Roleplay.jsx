// RoleplayScreen.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import "./roleplay.css";

// Helper to remove emojis from text (for TTS)
const removeEmojisFromText = (text) => {
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]|[\u{FE00}-\u{FE0F}]|[\u{1F200}-\u{1F2FF}]|[\u{E000}-\u{F8FF}]|[\u{2000}-\u{206F}]|[\u{FFF0}-\u{FFFF}]/gu;
  return text.replace(emojiRegex, "").replace(/\s+/g, " ").trim();
};

// Child-friendly TTS configuration
const configureTTSForChildren = (utterance) => {
  utterance.rate = 0.8;
  utterance.pitch = 1.3;
  utterance.volume = 0.9;

  const voices = speechSynthesis.getVoices();
  const preferredVoices = [
    /Google US English Female/i,
    /Microsoft Zira/i,
    /Samantha/i,
    /Fiona/i,
    /Victoria/i,
    /female/i,
    /woman/i,
    /.*/,
  ];

  let selectedVoice = null;
  for (const pattern of preferredVoices) {
    selectedVoice = voices.find(
      (voice) => pattern.test(voice.name) && voice.lang.startsWith("en")
    );
    if (selectedVoice) {
      break;
    }
  }
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }
  return utterance;
};

// TTS function: cleans text and speaks it
const speakText = (text, onStart, onEnd, onError) => {
  if (!("speechSynthesis" in window)) {
    onError && onError("Speech synthesis not supported");
    return;
  }
  speechSynthesis.cancel();
  const cleanText = removeEmojisFromText(text);
  if (!cleanText) {
    onEnd && onEnd();
    return;
  }
  const utterance = new SpeechSynthesisUtterance(cleanText);
  configureTTSForChildren(utterance);
  utterance.onstart = () => {
    onStart && onStart();
  };
  utterance.onend = () => {
    onEnd && onEnd();
  };
  utterance.onerror = (event) => {
    onError && onError(event.error);
  };
  speechSynthesis.speak(utterance);
};

// Define roleplay scenarios and steps
const roleplayScenarios = {
  school: {
    title: "At School",
    steps: [
      { prompt: "Hello! What's your name? 😊", field: "name" },
      {
        prompt:
          "Nice to meet you, {name}! How are you feeling about school today? 📚",
        field: null,
      },
      {
        prompt:
          "That's great! What's your favorite subject at school, {name}? 📝",
        field: "subject",
      },
      {
        prompt:
          "Nice! {subject} sounds fun! Who is your favorite teacher, {name}? 🍎",
        field: "teacher",
      },
      {
        prompt:
          "I'm sure {teacher} loves having you in class. Ready to learn something new today? 🎓",
        field: null,
      },
      { prompt: "Let's have a great day at school, {name}! 🎉", field: null },
    ],
  },
  store: {
    title: "At the Store",
    steps: [
      { prompt: "Hello! What's your name? 🛍️", field: "name" },
      {
        prompt: "Welcome, {name}! Are you shopping for something fun today? 🎁",
        field: null,
      },
      {
        prompt: "That's nice! What are you planning to buy, {name}? 🛒",
        field: "item",
      },
      {
        prompt: "What a great choice! Do you need any help finding {item}? 🏷️",
        field: null,
      },
      {
        prompt: "I hope you enjoy your shopping, {name}! See you next time! 👋",
        field: null,
      },
    ],
  },
  home: {
    title: "At Home",
    steps: [
      { prompt: "Hello! What's your name? 🏠", field: "name" },
      {
        prompt: "Nice to meet you, {name}! How are you doing at home today? 🏡",
        field: null,
      },
      {
        prompt:
          "That sounds good! Do you like playing games at home, {name}? 🎮",
        field: "likesGames",
      },
      {
        prompt: "Awesome! What games do you like to play, {name}? 🧸",
        field: "game",
      },
      {
        prompt:
          "Wow, {game} sounds like fun! Thanks for sharing with me, {name}! 🎉",
        field: null,
      },
    ],
  },
};

function RoleplayScreen() {
  const navigate = useNavigate();
  const [selectedScenario, setSelectedScenario] = useState("");
  const [currentStep, setCurrentStep] = useState(-1);
  const [userReplies, setUserReplies] = useState({});
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  const selectedScenarioRef = useRef(selectedScenario);
  const currentStepRef = useRef(currentStep);
  const userRepliesRef = useRef(userReplies);

  useEffect(() => {
    selectedScenarioRef.current = selectedScenario;
  }, [selectedScenario]);
  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);
  useEffect(() => {
    userRepliesRef.current = userReplies;
  }, [userReplies]);

  // Load voices for TTS
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length) {
        console.log(
          "Available voices:",
          voices.map((v) => v.name)
        );
      }
    };
    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  // Initialize speech recognition
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

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      if (!transcript) return;

      const newChildMessage = {
        id: Date.now(),
        sender: "child",
        text: transcript,
      };
      setMessages((prev) => [...prev, newChildMessage]);

      const scenarioKey = selectedScenarioRef.current;
      const scenario = roleplayScenarios[scenarioKey];
      const stepIndex = currentStepRef.current;
      const field = scenario.steps[stepIndex].field;

      const updatedReplies = { ...userRepliesRef.current };

      if (field) {
        let value = transcript;

        if (field === "name") {
          const nameMatch = value.match(/(?:my name is|i am|this is)?\s*(.+)/i);
          value = nameMatch ? nameMatch[1].trim() : value;
        }

        updatedReplies[field] = value;
        setUserReplies(updatedReplies);
      }

      const nextStepIndex = stepIndex + 1;
      if (nextStepIndex < scenario.steps.length) {
        let nextPrompt = scenario.steps[nextStepIndex].prompt;
        Object.keys(updatedReplies).forEach((key) => {
          nextPrompt = nextPrompt.replaceAll(`{${key}}`, updatedReplies[key]);
        });

        const newAiMessage = {
          id: Date.now() + 1,
          sender: "ai",
          text: nextPrompt,
        };

        setMessages((prev) => [...prev, newAiMessage]);
        setCurrentStep(nextStepIndex);

        speakText(
          nextPrompt,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false)
        );
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      const errorMessages = {
        "no-speech": "I didn't catch that. Please try again! 🎤",
        network: "Network issue. Check your connection! 🌐",
        "not-allowed": "Please allow microphone access! 🎤",
      };
      const message = errorMessages[event.error] || "Something went wrong! 😊";
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: "system",
          text: message,
        },
      ]);
    };

    recognitionRef.current = recognition;
  }, []);

  const startRoleplay = () => {
    if (!selectedScenario) return;
    setUserReplies({});
    setMessages([]);
    setCurrentStep(0);
    const firstPrompt = roleplayScenarios[selectedScenario].steps[0].prompt;
    setMessages([{ id: Date.now(), sender: "ai", text: firstPrompt }]);
    speakText(
      firstPrompt,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const startListeningFunc = () => {
    const scenario = roleplayScenarios[selectedScenario];
    if (!scenario) return;
    const lastIndex = scenario.steps.length - 1;
    if (
      recognitionRef.current &&
      !isListening &&
      !isSpeaking &&
      currentStep >= 0 &&
      currentStep < lastIndex
    ) {
      recognitionRef.current.start();
    }
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const lastIndex =
    selectedScenario && roleplayScenarios[selectedScenario]
      ? roleplayScenarios[selectedScenario].steps.length - 1
      : 0;

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
        <img src="/logo1.png" alt="Genie Logo" className="chat-logo" />
        <h2>Roleplay Mode</h2>
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
        {currentStep === -1 ? (
          <div className="roleplay-select-container">
            <h3>Select a scenario to start:</h3>
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="roleplay-select"
            >
              <option value="">-- Select Scenario --</option>
              {Object.entries(roleplayScenarios).map(([key, scen]) => (
                <option key={key} value={key}>
                  {scen.title}
                </option>
              ))}
            </select>
            <button
              onClick={startRoleplay}
              className="roleplay-start-btn"
              disabled={!selectedScenario}
            >
              Start Roleplay!
            </button>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.sender}`}>
              <div className="chat-avatar">
                {msg.sender === "ai" ? (
                  <img
                    src="/logo1.png"
                    alt="Genie Logo"
                    className="chat-logo"
                  />
                ) : (
                  <img
                    src="/logo2.png"
                    alt="Child Avatar"
                    className="chat-logo"
                  />
                )}
              </div>
              <div className="chat-bubble">
                {msg.text}
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
                    title="Replay prompt"
                  >
                    <img
                      src="/replay.png"
                      alt="Replay"
                      className="replay-logo"
                    />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      {currentStep >= 0 && (
        <div className="chat-footer">
          <button
            className={`mic-button ${isListening ? "listening" : ""} ${
              isSpeaking ? "disabled" : ""
            }`}
            onClick={startListeningFunc}
            disabled={isListening || isSpeaking || currentStep >= lastIndex}
            title={
              isSpeaking
                ? "Wait for Genie to finish..."
                : isListening
                ? "Listening..."
                : "Tap to answer"
            }
          >
            {isListening ? "🎙️" : isSpeaking ? "🔊" : "🎤"}
          </button>
        </div>
      )}
    </div>
  );
}

export default RoleplayScreen;
