import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";
import axios from "axios";
import API_BASE_URL from "./config";
import { useTranslation } from "react-i18next";
import { FaGlobe, FaEye, FaEyeSlash } from "react-icons/fa"; // ✅ נוסיף אייקונים

function Signup() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isPasswordStrong, setIsPasswordStrong] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // ✅ מצב הצגת סיסמה
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // ✅ מצב הצגת אימות סיסמה

  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.dir = lng === "he" ? "rtl" : "ltr";
    setIsDropdownOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...formData, [name]: value };
    setFormData(updatedForm);

    if (name === "password") evaluatePasswordStrength(value);

    if (name === "confirmPassword" || name === "password") {
      setPasswordMatch(updatedForm.password === updatedForm.confirmPassword);
    }
  };

  const evaluatePasswordStrength = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    let strength = 0;
    if (isLongEnough) strength += 25;
    if (hasLowerCase) strength += 25;
    if (hasUpperCase) strength += 25;
    if (hasNumber || hasSpecialChar) strength += 25;

    setPasswordStrength(strength);
    setIsPasswordStrong(strength === 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return alert(t("missing_fields"));
    if (!isPasswordStrong) return alert(t("weak_password"));
    if (!passwordMatch) return alert("הסיסמאות אינן תואמות");

    try {
      const response = await axios.post(`${API_BASE_URL}/signup`, {
        email: formData.email,
        password: formData.password,
      });
      alert(response.data.message);
      navigate("/login");
    } catch (error) {
      console.error("❌ שגיאה בהרשמה:", error);
      alert(error.response?.data?.message || t("server_error"));
    }
  };

  return (
    <div className="signup-container">
      {/* כפתור גלובוס */}
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

      <div className="signup-box">
        <h2>{t("signup")}</h2>
        <form onSubmit={handleSubmit}>
          <input type="email" name="email" placeholder={t("email")} onChange={handleChange} />

          {/* שדה סיסמה עם אייקון עין */}
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder={t("password")}
              onChange={handleChange}
            />
            <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="password-meter">
            <div
              className="password-meter-fill"
              style={{
                width: `${passwordStrength}%`,
                backgroundColor: passwordStrength === 100 ? "green" : "orange",
              }}
            />
          </div>

          {/* שדה אימות סיסמה עם אייקון עין */}
          <div className="password-field">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder={t("confirm_password")}
              onChange={handleChange}
              className={!passwordMatch ? "input-error" : ""}
            />
            <span className="eye-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {!passwordMatch && (
            <p style={{ color: "red", fontSize: "14px" }}>{t("password_mismatch")}</p>
          )}

          <button type="submit" disabled={!isPasswordStrong || !passwordMatch}>
            {t("signup")}
          </button>
        </form>
        <button className="back-button" onClick={() => navigate("/login")}>
          {t("back")}
        </button>
      </div>
    </div>
  );
}

export default Signup;
