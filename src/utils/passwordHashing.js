const bcrypt = require("bcryptjs");

class PasswordHashing {
  static async hashing(password) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash
  }

  static async comparing(password, hashpassword) {
    return await bcrypt.compare(password, hashpassword)
  }
}

module.exports = PasswordHashing
