import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import ForgotPassword from "./ForgotPassword";
import UserHome from "./UserHome";
import ResetPassword from "./ResetPassword";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          {/* ✅ הפניה מדף הבית (/) ל-login */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* ✅ דף התחברות */}
          <Route path="/login" element={<Login />} />

          {/* שאר הדפים */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/user-home" element={<UserHome />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;