import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";
import axios from "axios"; // ✅ נוספה קריאה לשרת
import API_BASE_URL from "./config"; // ✅ שימוש בכתובת השרת
import { useTranslation } from "react-i18next";
import { FaGlobe } from "react-icons/fa"; // אייקון גלובוס

function ForgotPassword() {
  const [formData, setFormData] = useState({ email: "" });
  const [message, setMessage] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.dir = lng === "he" ? "rtl" : "ltr";
    setIsDropdownOpen(false); // סגירת התפריט אחרי בחירת שפה
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // איפוס הודעה קודמת

    try {
        await axios.post(`${API_BASE_URL}/forgot-password`, { email: formData.email });
        setMessage(t("reset_email_sent")); // ✅ הודעה לאחר שליחה מוצלחת
    } catch (error) {
        if (error.response && error.response.data.message) {
            setMessage(t(error.response.data.message)); // ✅ תרגום הודעות שגיאה מהשרת
        } else {
            setMessage(t("error_sending"));
        }
    }
  };

  return (
    <div className="forgot-password-container">
      {/* 🔽 כפתור שינוי שפה */}
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

      <div className="forgot-password-box">
        <h2>{t("reset_password")}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder={t("email")}
            value={formData.email}
            onChange={handleChange}
            required
          />
          <button type="submit">{t("send_reset_link")}</button>
        </form>
        {message && <p className="message">{message}</p>}
        <button className="back-button" onClick={() => navigate("/login")}>
          {t("back")}
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;
