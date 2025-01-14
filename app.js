import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import Auth from "./app/routes/auth.js";
import MobAuth from "./app/routes/authMob.js";
import apiKeyMiddleware, { verifyToken } from "./app/routes/middleware.js";
import Survey from "./app/routes/surveys.js";
import User from "./app/routes/users.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

dotenv.config();
const port = process.env.PORT;

console.log(`PORT: ${port}`);

// app.use("/authenticate", Auth);
app.use("/authenticate",apiKeyMiddleware, Auth);
app.use("/auth", apiKeyMiddleware, MobAuth);
app.use("/survey", apiKeyMiddleware, verifyToken, Survey);
app.use("/users",apiKeyMiddleware,verifyToken,User);

app.get("/", (req, res) => {
  res.json("I am am wroking fine.");
});

app.listen(port, () => {
  console.log(`Server up and running on Port: ${port}`);
});
