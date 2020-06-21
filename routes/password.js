const express = require("express");
const hbs = require("nodemailer-express-handlebars");
const nodemailer = require("nodemailer");
const path = require("path");
const XOAuth2 = require("nodemailer/lib/xoauth2");

const email = process.env.EMAIL;
const password = process.env.PASSWORD;

const smtpTransport = nodemailer.createTransport({
  host: `smtp.${process.env.EMAIL_PROVIDER}.com`,
  secure: true,

  // auth: {
  //   user: email,
  //   pass: password,
  // },
  auth: {
    type: "OAuth2",
    user: email,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: '1//04MuyvLmnglJiCgYIARAAGAQSNwF-L9IrjvGDOKlzNbfvdgKw3h9quFHrd7EnWwbkvMuu1AyLGKKw24HxILlR5BuRFkYjgF1fnaM'
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
  if (!req.body || !req.body.email) {
    res.status(400).json({ message: "invalid body", status: 400 });
  } else {
    const userEmail = req.body.email;

    // send user password reset email
    const emailOptions = {
      to: userEmail,
      from: email,
      template: "forgot-password",
      subject: "Zombie Attack password reset",
      context: {
        name: "Shawn",
        url: `http://localhost:${process.env.PORT || 3000}`,
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
  }
});

router.post("/reset-password", async (req, res) => {
  if (!req.body || !req.body.email) {
    res.status(400).json({ message: "invalid body", status: 400 });
  } else {
    const userEmail = req.body.email;

    // send user password reset email
    const emailOptions = {
      to: userEmail,
      from: email,
      template: "reset-password",
      subject: "Zombie Attack password reset confirmation",
      context: {
        name: "Shawn",
      },
    };
    await smtpTransport.sendMail(emailOptions);

    res.status(200).json({
      message: "password updated",
      status: 200,
    });
  }
});

module.exports = router;
