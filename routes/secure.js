const express = require("express");

const ChatModel = require("../models/ChatModel");

const router = express.Router();

router.post("/chat", async (req, res, done) => {
  try {
    if (!req.body || !req.body.message) {
      res.status(400).json({ message: "invalid body", status: 400 });
    } else {
      const { message } = req.body;
      const { email } = req.user;
      const chat = await ChatModel.create({ email, message });
      res.status(200).json({ chat, message: "message sent", status: 200 });
    }
  } catch (error) {
    done(error);
  }
});

module.exports = router;
