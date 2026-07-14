const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * Auth user — documents stay lean.
 * New email/password accounts store: email, username, password (+ _id / timestamps).
 * Optional profile / Google fields are only written when set.
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
      unique: true,
      sparse: true,
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
    // Optional — only present when used
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
    },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    profilePicture: { type: String },
    profilePictureDriveId: { type: String },
    bio: { type: String },
    followersCount: { type: Number, min: 0 },
    followers: { type: [mongoose.Schema.Types.ObjectId], ref: "User" },
    followingCount: { type: Number, min: 0 },
    following: { type: [mongoose.Schema.Types.ObjectId], ref: "User" },
    preferredLanguages: { type: [String] },
    isActive: { type: Boolean },
    lastLogin: { type: Date },
    currentStreak: { type: Number },
    highestStreak: { type: Number },
    lastChallengeDate: { type: Date },
  },
  {
    timestamps: true,
    minimize: true,
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

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.googleId;
  return user;
};

module.exports = mongoose.model("User", userSchema);
