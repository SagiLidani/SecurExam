import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaGlobe } from "react-icons/fa";
import "./UserHome.css";

function UserHome() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.dir = lng === "he" ? "rtl" : "ltr";
    setIsDropdownOpen(false);
  };

  return (
    <div className="user-home-container">
      {/* כפתור גלובוס לשפה */}
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

      <div className="user-home-box">
        <h2>{t("welcome")}</h2>
        <p>{t("login_success")}</p>
        <button onClick={handleLogout}>{t("logout")}</button>
      </div>
    </div>
  );
}

export default UserHome;
