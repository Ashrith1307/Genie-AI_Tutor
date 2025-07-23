import React from "react";
import HomeScreen from "./assets/home";
import ChatScreen from "./assets/chat";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/chat" element={<ChatScreen />} />
      </Routes>
    </Router>
  );
}
