const express = require("express");
const router = express.Router();

const User = require("../model/User");

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

/**
 * Sign up
 * @param {Object} body
 * @param {string} [body.username]
 * @param {number} [body.email]
 * @param {number} [body.password]
 * @param {number} [body.newsletter]
 * @returns {Object}
 */

router.post("/user/signup", async (req, res) => {
  try {
    // Missing parameter
    if (
      !req.body.username &&
      !req.body.email &&
      !req.body.password &&
      !req.body.newsletter
    ) {
      return res.status(400).json({ message: "Missing parameter" });
    }

    // An account for this email already exists
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) {
      return res
        .status(400)
        .json({ message: "An account for this email already exists" });
    }

    // Create user and response
    const { username, email, password, newsletter } = req.body;
    const salt = uid2(16);
    const hash = SHA256(password + salt).toString(encBase64);
    const token = uid2(16);

    const newUser = new User({
      email: email,
      account: {
        username: username,
        avatar: null,
      },
      salt: salt,
      hash: hash,
      token: token,
      newsletter: newsletter,
    });
    await newUser.save();


    res.status(200).json({
      _id: newUser.id,
      token: newUser.token,
      account: {
        username: newUser.account.username,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * Login
 * @param {Object} body
 * @param {string} [body.username]
 * @param {number} [body.password]
 * @returns {Object}
 */

router.post("/user/signin", async (req, res) => {
  try {
    // Missing parameter
    if (!req.body.email && !req.body.password) {
      return res.status(400).json({ message: "Missing parameter" });
    }

    // req
    const { email, password } = req.body;

    // No account exists for this email
    const userToAuth = await User.findOne({ email: email });
    if (!userToAuth) {
      return res
        .status(400)
        .json({ message: "No account exists for this email" });
    }

    // Compare hash
    const hashToAuth = SHA256(password + userToAuth.salt).toString(encBase64);
    if (hashToAuth !== userToAuth.hash) {
      return res.status(400).json({
        message: "Wrong password (test)",
        password: password,
        hash: hashToAuth
      });
    }

    // Create user and response
    res.status(200).json({
      _id: userToAuth.id,
      token: userToAuth.token,
      account: {
        username: userToAuth.account.username,
      },
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
