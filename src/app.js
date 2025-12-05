import express from "express";
import users from "./routes/users.js";
import reports from "./routes/reports.js";
import auth from "./routes/auth.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT;
//nodemon for realtime updates in api

connectDB();
app.use(
  cors({
    origin: "http://localhost:5173", // your React app
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static("src/uploads"));
app.use("/auth", auth);
app.use("/users", users);
app.use("/reports", reports);

app.listen(3000, () => {
  console.log("Server started on port:", PORT);
});
