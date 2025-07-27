import React from "react";
import HomeScreen from "./assets/home";
import ChatScreen from "./assets/chat";
import RoleplayScreen from "./assets/Roleplay";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/chat" element={<ChatScreen />} />
        <Route path="/roleplay" element={<RoleplayScreen />} />
      </Routes>
    </Router>
  );
}
