const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const tokenList = {};
const router = express.Router();

// router.get("/", (request, response) => {
//   response.send("Hello world");
// });

router.get("/status", (req, res) => {
  res.status(200).json({ message: "ok", status: 200 });
});

router.post(
  "/signup",
  passport.authenticate("signup", { session: false }),
  async (req, res, next) => {
    res.status(200).json({ message: "signup successful", status: 200 });
  }
);

router.post("/login", async (req, res, next) => {
  passport.authenticate("login", async (error, user) => {
    try {
      if (error) {
        return next(error);
      }
      if (!user) {
        return next(new Error("Email and password are required."));
      }

      req.login(user, { session: false }, (error) => {
        if (error) return next(error);

        // create our jwt
        const body = {
          _id: user._id,
          email: user.email,
          name: user.username,
        };

        const token = jwt.sign({ user: body }, process.env.JWT_SECRET, {
          expiresIn: 300,
        });
        const refreshToken = jwt.sign(
          { user: body },
          process.env.JWT_REFRESH_SECRET,
          {
            expiresIn: 86400,
          }
        );

        // store tokens in cookie
        res.cookie("jwt", token);
        res.cookie("refreshJwt", refreshToken);

        // store tokens in memory
        tokenList[refreshToken] = {
          token,
          refreshToken,
          email: user.email,
          _id: user._id,
          name: user.name,
        };

        // send the token to the user
        return res.status(200).json({ token, refreshToken, status: 200 });
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  })(req, res, next);
});

const processLogoutRequest = (req, res) => {
  if (req.cookies) {
    const refreshToken = req.cookies.refreshJwt;
    if (refreshToken in tokenList) delete tokenList[refreshToken];
    res.clearCookie("jwt");
    res.clearCookie("refreshJwt");
  }
  if (req.method === "POST") {
    res.status(200).json({ message: "Logged out post", status: 200 });
  } else if (req.method === "GET") {
    res.sendFile("logout.html", { root: "./public" });
  }
};

router.route("/logout").get(processLogoutRequest).post(processLogoutRequest);

router.post("/token", (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken in tokenList) {
    const body = {
      email: tokenList[refreshToken].email,
      _id: tokenList[refreshToken]._id,
      name: tokenList[refreshToken].name,
    };
    const token = jwt.sign({ user: body }, process.env.JWT_SECRET, {
      expiresIn: 300,
    });

    // update jwt
    res.cookie("jwt", token);
    tokenList[refreshToken].token = token;
    res.status(200).json({ token, status: 200 });
  } else {
    res.status(401).json({ message: "unauthorized", status: 401 });
  }
});

module.exports = router;
