const User = require("../model/User");

const auth = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await User.findOne({
      token: req.headers.authorization.split(" ").pop(),
    }).select("account");

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = auth;
