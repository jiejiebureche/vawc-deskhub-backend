import express from "express";
import users from "./routes/users.js";
import reports from "./routes/reports.js";
import auth from "./routes/auth.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;



connectDB();
app.use(
  cors({
    origin: "https://vawcdeskhub.netlify.app", // your React app
    // origin: "https://vawc-deskhub.vercel.app",// your React app
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static("src/uploads"));
app.use("/auth", auth);
app.use("/users", users);
app.use("/reports", reports);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
