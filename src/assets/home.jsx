import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import "./HomeScreen.css";

function HomeScreen() {
  const navigate = useNavigate();
  const [fadeIn, setFadeIn] = useState(false);
  const [hoverMessage, setHoverMessage] = useState("");

  useEffect(() => {
    setFadeIn(true);
  }, []);

  return (
    <div className={`home-container ${fadeIn ? "fade-in" : ""}`}>
      <div className="logo-container">
        <img src="public/logo1.png" alt="Genie cartoon logo" className="logo" />
        {hoverMessage && <span className="hover-text">{hoverMessage}</span>}
      </div>
      <h1>Hi! I’m Genie, your English buddy 🤖</h1>
      <div className="button-group">
        <button
          className="mode-button free-chat"
          onMouseEnter={() => setHoverMessage("Talk with me!")}
          onMouseLeave={() => setHoverMessage("")}
          onClick={() => navigate("/chat")} // Redirects to ChatScreen
        >
          Free Chat Mode
        </button>
        <button
          className="mode-button roleplay"
          onMouseEnter={() => setHoverMessage("Which Role?")}
          onMouseLeave={() => setHoverMessage("")}
          onClick={() => navigate("/roleplay")} // Redirects to RoleplayScreen
        >
          Roleplay Mode
        </button>
      </div>
    </div>
  );
}

export default HomeScreen;
