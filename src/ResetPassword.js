import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "./config";
import "./ResetPassword.css";
import { useTranslation } from "react-i18next";
import { FaGlobe, FaEye, FaEyeSlash } from "react-icons/fa";

function ResetPassword() {
  const [formData, setFormData] = useState({ email: "", token: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isPasswordStrong, setIsPasswordStrong] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const email = params.get("email");
    const token = params.get("token");
    if (email && token) setFormData((prev) => ({ ...prev, email, token }));
  }, [location]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.dir = lng === "he" ? "rtl" : "ltr";
    setIsDropdownOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    if (name === "newPassword") evaluatePasswordStrength(value);
    if (name === "confirmPassword" || name === "newPassword") {
      setPasswordMatch(updated.newPassword === updated.confirmPassword);
    }
  };

  const evaluatePasswordStrength = (password) => {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);
    const isLong = password.length >= 8;

    let strength = 0;
    if (isLong) strength += 25;
    if (hasLower) strength += 25;
    if (hasUpper) strength += 25;
    if (hasNumber || hasSpecial) strength += 25;

    setPasswordStrength(strength);
    setIsPasswordStrong(strength === 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPasswordStrong) return alert(t("weak_password"));
    if (!passwordMatch) return alert(t("password_mismatch"));

    try {
      const response = await axios.post(`${API_BASE_URL}/reset-password`, {
        email: formData.email,
        token: formData.token,
        newPassword: formData.newPassword,
      });
      setMessage(response.data.message);
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || t("general_error"));
    }
  };

  return (
    <div className="reset-password-container">
      {/* כפתור שינוי שפה */}
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

      <div className="reset-password-box">
        <h2>{t("reset_password")}</h2>
        <form onSubmit={handleSubmit}>
          <input type="email" name="email" placeholder={t("email")} value={formData.email} disabled />

          {/* סיסמה חדשה עם עין */}
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              name="newPassword"
              placeholder={t("new_password")}
              value={formData.newPassword}
              onChange={handleChange}
            />
            <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* מד חוזק סיסמה */}
          <div className="password-meter">
            <div
              className="password-meter-fill"
              style={{
                width: `${passwordStrength}%`,
                backgroundColor: passwordStrength === 100 ? "green" : "orange",
              }}
            />
          </div>

          {/* אימות סיסמה עם עין */}
          <div className="password-container">
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder={t("confirm_password")}
              value={formData.confirmPassword}
              onChange={handleChange}
              className={!passwordMatch ? "input-error" : ""}
            />
            <span className="eye-icon" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {!passwordMatch && (
            <p className="message error">{t("password_mismatch")}</p>
          )}

          <button type="submit" disabled={!isPasswordStrong || !passwordMatch}>
            {t("reset_password")}
          </button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default ResetPassword;
