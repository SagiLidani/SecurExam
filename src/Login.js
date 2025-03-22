import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import axios from "axios";
import API_BASE_URL from "./config";
import { useTranslation } from "react-i18next";
import { FaGlobe, FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false); // ✅ מצב להצגת הסיסמה
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.dir = lng === "he" ? "rtl" : "ltr";
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, formData);
      if (response && response.data) {
        localStorage.setItem("token", response.data.token);
        navigate("/user-home");
      } else {
        alert(t("empty_response_error"));
      }
    } catch (error) {
      console.error("שגיאה בהתחברות:", error);
      alert(error.response?.data?.message || t("general_error"));
    }
  };

  return (
    <div className="login-container">
      {/* 🔽 כפתור גלובוס + תפריט שפה */}
      <div className="language-container">
        <button className="language-button" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <FaGlobe />
        </button>
        {isDropdownOpen && (
          <div className="language-dropdown">
            <button onClick={() => changeLanguage("he")}>עברית</button>
            <button onClick={() => changeLanguage("en")}>English</button>
          </div>
        )}
      </div>

      <div className="login-box">
        <h2>{t("login")}</h2>
        <form onSubmit={handleSubmit}>
          <input type="email" name="email" placeholder={t("email")} onChange={handleChange} />

          {/* 🔹 שדה סיסמה עם אייקון עין בתוך הקלט */}
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"} // ✅ שינוי בין text ל-password
              name="password"
              placeholder={t("password")}
              onChange={handleChange}
            />
            <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit">{t("login")}</button>
        </form>
        <p>
          {t("no_account")}{" "}
          <button onClick={() => navigate("/signup")}>{t("signup_here")}</button>
        </p>
        <p>
          {t("forgot_password")}{" "}
          <button onClick={() => navigate("/forgot-password")}>{t("reset_password")}</button>
        </p>
      </div>
    </div>
  );
}

export default Login;
