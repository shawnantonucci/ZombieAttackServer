const express = require("express");
const hbs = require("nodemailer-express-handlebars");
const nodemailer = require("nodemailer");
const path = require("path");
const crypto = require("crypto");

const UserModel = require("../models/UserModel");

const email = process.env.EMAIL;

const smtpTransport = nodemailer.createTransport({
  host: `smtp.${process.env.EMAIL_PROVIDER}.com`,
  secure: true,
  auth: {
    type: "OAuth2",
    user: email,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

const handleBarsOptions = {
  viewEngine: {
    extName: ".hbs",
    defaultLayout: null,
    partialsDir: "./templates/",
    layoutsDir: "./templates/",
  },
  viewPath: path.resolve("./templates/"),
  extName: ".html",
};

smtpTransport.use("compile", hbs(handleBarsOptions));

const router = express.Router();

router.post("/forgot-password", async (req, res) => {
  const userEmail = req.body.email;
  const user = await UserModel.findOne({ email: userEmail });
  if (!user) {
    res.status(400).json({ message: "invalid email", status: 400 });
    return;
  }

  // create user token
  const buffer = crypto.randomBytes(20);
  const token = buffer.toString("hex");

  // update user reset password token and expiration
  await UserModel.findByIdAndUpdate(
    { _id: user._id },
    { resetToken: token, resetTokenExp: Date.now() + 600000 }
  );

  // send user password reset email
  const emailOptions = {
    to: userEmail,
    from: email,
    template: "forgot-password",
    subject: "Zombie Attack password reset",
    context: {
      name: "Shawn",
      url: `http://localhost:${process.env.PORT || 3000}/reset-password.html?token=${token}`,
    },
  };
  await smtpTransport.sendMail(emailOptions, function (error, res, done) {
    try {
    } catch (error) {}
  });

  res.status(200).json({
    message:
      "An email has been sent to your email address. Password link is only valid for 10 minutes.",
    status: 200,
  });
});

router.post("/reset-password", async (req, res) => {
  const userEmail = req.body.email;
  const user = await UserModel.findOne({
    resetToken: req.body.token,
    resetTokenExp: { $gt: Date.now() },
    email: userEmail,
  });

  if (!user) {
    res.status(400).json({ message: "invalid token", status: 400 });
    return;
  }

  // ensure password was provided, and that the password matches the verified password
  if (
    !req.body.password ||
    !req.body.verifiedPassword ||
    req.body.password !== req.body.verifiedPassword
  ) {
    res.status(400).json({ message: "passwords do not match", status: 400 });
    return;
  }

  // update user model
  user.password = req.body.password;
  user.resetToken = undefined;
  user.resetTokenExp = undefined;
  await user.save();

  // send user password reset email
  const emailOptions = {
    to: userEmail,
    from: email,
    template: "reset-password",
    subject: "Zombie Attack password reset confirmation",
    context: {
      name: user.username,
    },
  };
  await smtpTransport.sendMail(emailOptions, function (error, res, done) {
    try {
    } catch (error) {}
  });
  res.status(200).json({ message: "password updated", status: 200 });
});

module.exports = router;
