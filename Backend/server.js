import express, { json } from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";
import Thread from "./models/Thread.js";
import { authenticate } from "./utils/Verify.js";

import admin from "firebase-admin";
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(cors());


app.use("/api", chatRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
  connect();
});

const connect = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("Conneted to DATABASE");
  } catch (err) {
    console.log("Error in Connecting to DB", err.message);
  }
};
