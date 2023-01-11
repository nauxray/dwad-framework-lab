const crypto = require("crypto");

const getHashedPassword = (pw) => {
  const sha256 = crypto.createHash("sha256");
  const hash = sha256.update(pw).digest("base64");
  return hash;
};

module.exports = { getHashedPassword };
