const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * Lean user documents:
 *   { email, username, password, name }
 * Google accounts may also store googleId (no password).
 */
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    username: {
      type: String,
      required: [true, "Please provide a username"],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: [
        /^[a-z0-9_][a-z0-9_.-]{2,29}$/,
        "Username must be 3–30 characters and use letters, numbers, _, ., or -",
      ],
    },
    password: {
      type: String,
      required: false,
      minlength: 6,
      select: false,
    },
    name: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
    minimize: true,
    strict: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  if (!this.password) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

/** Keep older UI fields working without storing them in Mongo. */
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.googleId;

  const parts = String(user.name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  user.firstName = parts[0] || "";
  user.lastName = parts.length > 1 ? parts.slice(1).join(" ") : "";
  user.bio = "";
  user.isActive = true;
  return user;
};

module.exports = mongoose.model("User", userSchema);
