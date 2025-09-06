import express from "express";
import Thread from "../models/Thread.js";
import { getGeminiResponse } from "../utils/gemini.js";
import { authenticate } from "../utils/Verify.js";

const router = express.Router();

router.get("/thread", authenticate, async (req, res) => {
  //provides all the threads for the title purpose
  try {
    const threads = await Thread.find({ user: req.userId }).sort({
      updatedAt: -1,
    });
    //descending order of updatedAt...most recent data on top
    res.json(threads);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch threads" });
  }
});

router.get("/thread/:threadId", async (req, res) => {
  //provides only one thread when we click on the thread that corresponding chat is displayed at main content
  const { threadId } = req.params;

  try {
    const thread = await Thread.findOne({ threadId });

    if (!thread) {
      res.status(404).json({ error: "Thread not found" });
      return;
    }

    res.json(thread.messages);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch chat" });
  }
});

router.delete("/thread/:threadId", async (req, res) => {
  //deletes a thread
  const { threadId } = req.params;

  try {
    const deletedThread = await Thread.findOneAndDelete({ threadId });

    if (!deletedThread) {
      res.status(404).json({ error: "Thread not found" });
    }

    res.status(200).json({ success: "Thread deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to delete thread" });
  }
});

router.post("/chat", authenticate, async (req, res) => {
  // makes actual requests to gemini
  const { threadId, message } = req.body;

  if (!threadId || !message) {
    res.status(400).json({ error: "missing required fields" });
  }

  try {
    let thread = await Thread.findOne({ threadId });

    if (!thread) {
      //create a new thread in Db
      thread = new Thread({
        threadId,
        title: message,
        messages: [{ role: "user", content: message }],
        user: req.userId,
      });
    } else {
      thread.messages.push({ role: "user", content: message });
    }

    const assistantReply = await getGeminiResponse(message);

    thread.messages.push({ role: "assistant", content: assistantReply });
    thread.updatedAt = new Date();

    await thread.save();
    res.status(200).json({ reply: assistantReply });
  } catch (err) {
    console.log("Error in chat route : ", err);
    res.status(500).json({ error: "something went wrong" });
  }
});

// router.post("/chat/voice", async (req, res) => {
//   const { threadId, audioData } = req.body;
//   console.log(audioData);

//   if (!audioData) {
//     console.log("no audio data provided!");
//     return res.status(400).json({ error: "No audio data provided" });
//   }

//   try {
//     // Convert audio → text
//     const userText = await speechToText(audioData);
//     console.log("text converted : ", userText);

//     if (!userText || userText.trim() === "") {
//       console.log("speech to text failed !");
//       return res.status(400).json({ error: "Speech-to-text failed" });
//     }

//     let thread = await Thread.findOne({ threadId });

//     if (!thread) {
//       // create new thread if not exists
//       thread = new Thread({
//         threadId,
//         title: userText,
//         messages: [{ role: "user", content: userText }],
//       });
//     } else {
//       thread.messages.push({ role: "user", content: userText });
//     }

//     // Get assistant reply
//     const assistantReply = await getGeminiResponse(userText);

//     if (!assistantReply || assistantReply.trim() === "") {
//       console.log("assistant reply failed");
//       return res
//         .status(500)
//         .json({ error: "Assistant reply failed", userText });
//     }

//     thread.messages.push({ role: "assistant", content: assistantReply });

//     thread.updatedAt = new Date();
//     await thread.save();

//     res.json({ reply: assistantReply, userText });
//   } catch (err) {
//     console.error("Voice Chat Error:", err);
//     res.status(500).json({ error: "Voice chat failed" });
//   }
// });

export default router;
