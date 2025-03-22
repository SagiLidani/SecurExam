require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("./models/user");
const crypto = require("crypto");

// 🔽 תרגום
const i18next = require("i18next");
const Backend = require("i18next-fs-backend");
const middleware = require("i18next-http-middleware");
const path = require("path");

// 🔽 אתחול תרגום
i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: "he",
    preload: ["en", "he"],
    backend: {
      loadPath: path.join(__dirname, "/locales/{{lng}}/translation.json")
    }
  });

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(middleware.handle(i18next));

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/myDatabase";
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

console.log("🔍 MONGO_URI:", MONGO_URI);

mongoose.connect(MONGO_URI)
  .then(() => console.log("🔗 מחובר ל-MongoDB"))
  .catch(err => console.error("❌ שגיאה בחיבור ל-MongoDB:", err));

// Middleware לבדיקה אם משתמש מחובר
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ message: req.t("access_denied") });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: req.t("invalid_token") });
    req.user = decoded;
    next();
  });
};

// 📌 API לרישום משתמשים
app.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: req.t("missing_fields") });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: req.t("email_already_exists") });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });

    await newUser.save();
    res.status(201).json({ message: req.t("signup_success") });
  } catch (error) {
    console.error("❌ שגיאה בהרשמה:", error);
    res.status(500).json({ message: req.t("server_error") });
  }
});

// 📌 API להתחברות משתמשים
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: req.t("missing_fields") });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: req.t("user_not_found") });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: req.t("incorrect_password") });

    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: req.t("login_success"), token });
  } catch (error) {
    console.error("❌ שגיאה בהתחברות:", error);
    res.status(500).json({ message: req.t("server_error") });
  }
});

// 📌 API לאיפוס סיסמה
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: req.t("email_not_found") });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}&email=${email}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: req.t("password_reset"),
      html: `<h2>${req.t("password_reset_request")}</h2>
             <p>${req.t("click_link_to_reset")}</p>
             <a href="${resetLink}" target="_blank">${resetLink}</a>
             <p>${req.t("link_expires_in_10min")}</p>`
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: req.t("reset_email_sent") });

  } catch (error) {
    console.error("❌ שגיאה בשליחת האימייל:", error);
    res.status(500).json({ message: req.t("error_sending") });
  }
});

// 📌 API לאיפוס סיסמה בפועל
app.post("/reset-password", async (req, res) => {
  const { email, token, newPassword } = req.body;

  try {
    const user = await User.findOne({ email, resetToken: token });
    if (!user) return res.status(400).json({ message: req.t("invalid_or_expired_link") });

    if (user.resetTokenExpiry < Date.now()) {
      return res.status(400).json({ message: req.t("invalid_or_expired_link") });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await user.save({ validateBeforeSave: false });

    res.json({ message: req.t("reset_success") });
  } catch (error) {
    console.error("❌ שגיאה באיפוס סיסמה:", error);
    res.status(500).json({ message: req.t("server_error") });
  }
});

// 📌 הגנה על דף המשתמש
app.get("/user-home", verifyToken, (req, res) => {
  res.json({ message: req.t("welcome") + ", " + req.user.email });
});

// 📌 הפעלת השרת
app.listen(5000, () => console.log("🚀 השרת רץ על פורט 5000"));
