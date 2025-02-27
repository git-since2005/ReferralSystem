import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Components/Login";
import SignUp from "./Components/SignUp"
import Email from "./Components/Email"
import Repass from "./Components/Repass"
import Dashboard from "./Components/Dashboard"

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/enter-email" element={<Email />} />
          <Route path="/reset-password" element={<Repass />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
