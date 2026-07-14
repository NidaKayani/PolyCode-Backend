const User = require("../models/User");
const {
  syncPolycoderForEmailSafe,
  getMainSocialByEmail,
  updateMainFollowerEmailSafe,
  normalizeEmail,
} = require("../../../services/mainUserSyncService");

function capitalizeNamePart(value = "") {
  const trimmed = String(value).trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

/** Join first / middle / last (or any loose parts) into one display name. */
function buildFullName(...parts) {
  return parts
    .flatMap((part) => String(part || "").trim().split(/\s+/))
    .map((part) => part.trim())
    .filter(Boolean)
    .map(capitalizeNamePart)
    .join(" ")
    .slice(0, 120);
}

const USERNAME_RE = /^[a-z0-9_][a-z0-9_.-]{2,29}$/;

function slugifyUsername(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_.-]+/g, "_")
    .replace(/^[^a-z0-9_]+/, "")
    .slice(0, 29);
}

/** Older accounts may lack username — create one from email so profiles work. */
async function ensureUsername(userDoc) {
  if (userDoc.username && USERNAME_RE.test(userDoc.username)) {
    return userDoc;
  }

  const emailLocal = userDoc.email?.split("@")[0] || "user";
  let base = slugifyUsername(emailLocal);
  if (base.length < 3) {
    base = `user_${String(userDoc._id).slice(-6)}`;
  }

  let candidate = base;
  let suffix = 0;
  while (
    await User.findOne({ username: candidate, _id: { $ne: userDoc._id } })
  ) {
    suffix += 1;
    candidate = `${base.slice(0, 24)}_${suffix}`;
  }

  userDoc.username = candidate;
  await userDoc.save();
  return userDoc;
}

async function enrichWithMainSocial(serializedUser) {
  const social = await getMainSocialByEmail(serializedUser.email);
  serializedUser.followersCount = social.followers.length;
  serializedUser.followingCount = social.followings.length;
  serializedUser.followerEmails = social.followers;
  serializedUser.followingEmails = social.followings;
  if (social.found && social.avatar && !serializedUser.profilePicture) {
    serializedUser.profilePicture = social.avatar;
  }
  if (social.found && social.name && !serializedUser.name) {
    serializedUser.name = social.name;
    const parts = String(social.name).trim().split(/\s+/).filter(Boolean);
    serializedUser.firstName = parts[0] || "";
    serializedUser.lastName = parts.length > 1 ? parts.slice(1).join(" ") : "";
  }
  serializedUser.polycoder = social.polycoder || serializedUser.username;
  return serializedUser;
}

async function toPublicUser(userDoc) {
  const withUsername = await ensureUsername(userDoc);
  const serializedUser = withUsername.toJSON();

  // Always try to write polycoder on matching quantum_logics email.
  await syncPolycoderForEmailSafe({
    email: serializedUser.email,
    username: serializedUser.username,
  });

  return enrichWithMainSocial(serializedUser);
}

/**
 * Register a new user
 * @param {Object} userData - email, username, password, name (or first/middle/last)
 */
async function registerUser(userData) {
  try {
    const { email, username, password } = userData;
    const name =
      buildFullName(
        userData.name,
        userData.firstName,
        userData.middleName,
        userData.lastName,
      ) || undefined;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      throw new Error("Email or username already in use");
    }

    const payload = { email, username, password };
    if (name) payload.name = name;

    const user = new User(payload);
    await user.save();
    return toPublicUser(user);
  } catch (error) {
    throw error;
  }
}

/**
 * Login user - verify credentials
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User object
 */
async function loginUser(email, password) {
  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (!user.password) {
      throw new Error(
        "This account uses Google Sign-In. Please continue with Google.",
      );
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return toPublicUser(user);
  } catch (error) {
    throw error;
  }
}

/**
 * Sign in / sign up with a verified Google ID token payload.
 * @param {object} profile - { googleId, email, firstName, lastName }
 */
async function loginOrRegisterWithGoogle(profile = {}) {
  const googleId = String(profile.googleId || "").trim();
  const email = String(profile.email || "")
    .trim()
    .toLowerCase();

  if (!googleId || !email) {
    throw new Error("Google account email is required");
  }

  const name = buildFullName(profile.name, profile.firstName, profile.lastName);

  let user = await User.findOne({ googleId });

  if (!user) {
    user = await User.findOne({ email });
  }

  if (user) {
    if (!user.googleId) user.googleId = googleId;
    if (name && !user.name) user.name = name;
    await user.save();
    return toPublicUser(user);
  }

  const emailLocal = email.split("@")[0] || "user";
  let base = slugifyUsername(emailLocal);
  if (base.length < 3) {
    base = `user_${googleId.slice(-6)}`;
  }

  let username = base;
  let suffix = 0;
  while (await User.findOne({ username })) {
    suffix += 1;
    username = `${base.slice(0, 24)}_${suffix}`;
  }

  const createPayload = {
    email,
    username,
    googleId,
  };
  if (name) createPayload.name = name;

  user = new User(createPayload);
  await user.save();
  return toPublicUser(user);
}

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User object
 */
async function getUserById(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return toPublicUser(user);
  } catch (error) {
    throw error;
  }
}

/**
 * Get public user profile by username
 * @param {string} username - Username handle
 * @returns {Promise<Object>} User object
 */
async function getUserByUsername(username) {
  try {
    const normalizedUsername = String(username || "").trim().toLowerCase();
    if (!/^[a-z0-9_][a-z0-9_.-]{2,29}$/.test(normalizedUsername)) {
      throw new Error("User not found");
    }

    const user = await User.findOne({
      username: normalizedUsername,
    });

    if (!user) {
      throw new Error("User not found");
    }

    return toPublicUser(user);
  } catch (error) {
    throw error;
  }
}

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {Promise<Object>} User object
 */
async function getUserByEmail(email) {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }
    return user.toJSON();
  } catch (error) {
    throw error;
  }
}

function toUserSummary(user = {}) {
  const name =
    user.name ||
    buildFullName(user.firstName, user.lastName) ||
    "";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    _id: user._id,
    id: user._id,
    username: user.username,
    name,
    firstName: parts[0] || "",
    lastName: parts.length > 1 ? parts.slice(1).join(" ") : "",
    email: user.email,
    followersCount: Number(user.followersCount) || 0,
    followingCount: Number(user.followingCount) || 0,
  };
}

/**
 * List followers or following from quantum_logics.users (by email arrays).
 */
async function listUserConnections(username, type = "followers") {
  const normalizedUsername = String(username || "").trim().toLowerCase();
  if (!USERNAME_RE.test(normalizedUsername)) {
    throw new Error("User not found");
  }

  const user = await User.findOne({ username: normalizedUsername });
  if (!user) {
    throw new Error("User not found");
  }

  const social = await getMainSocialByEmail(user.email);
  const emails =
    type === "following" || type === "followings"
      ? social.followings
      : social.followers;

  if (!emails.length) return [];

  const polyUsers = await User.find({
    email: { $in: emails },
  }).lean();

  const byEmail = new Map(
    polyUsers.map((row) => [normalizeEmail(row.email), row]),
  );

  return emails.map((email) => {
    const poly = byEmail.get(email);
    if (poly) {
      return toUserSummary({
        ...poly,
        name: poly.name,
        firstName: undefined,
        lastName: undefined,
      });
    }
    return toUserSummary({
      _id: email,
      username: email.split("@")[0],
      email,
      name: email,
    });
  });
}

/**
 * Update user profile — only username + name persist on the user document.
 */
async function updateUserProfile(userId, updateData) {
  try {
    const filteredData = {};

    if (updateData.username !== undefined) {
      const nextUsername = String(updateData.username).trim().toLowerCase();
      if (nextUsername.length < 3 || nextUsername.length > 30) {
        throw new Error("Username must be between 3 and 30 characters");
      }
      const taken = await User.findOne({
        username: nextUsername,
        _id: { $ne: userId },
      });
      if (taken) {
        throw new Error("Username is already taken");
      }
      filteredData.username = nextUsername;
    }

    if (updateData.name !== undefined) {
      filteredData.name = buildFullName(updateData.name);
    } else if (
      updateData.firstName !== undefined ||
      updateData.middleName !== undefined ||
      updateData.lastName !== undefined
    ) {
      filteredData.name = buildFullName(
        updateData.firstName,
        updateData.middleName,
        updateData.lastName,
      );
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { ...filteredData, updatedAt: Date.now() },
      { new: true, runValidators: true },
    );

    if (!user) {
      throw new Error("User not found");
    }

    return toPublicUser(user);
  } catch (error) {
    throw error;
  }
}

/**
 * Follow / unfollow via quantum_logics.users followers + followings arrays.
 */
async function setFollowRelationship(currentUserId, targetUsername, shouldFollow) {
  const normalizedUsername = String(targetUsername || "").trim().toLowerCase();
  if (!USERNAME_RE.test(normalizedUsername)) {
    throw new Error("User not found");
  }

  const [currentUser, targetUser] = await Promise.all([
    User.findById(currentUserId),
    User.findOne({ username: normalizedUsername }),
  ]);

  if (!currentUser) throw new Error("Current user not found");
  if (!targetUser) throw new Error("User not found");
  if (String(currentUser._id) === String(targetUser._id)) {
    throw new Error("You cannot follow yourself");
  }

  const result = await updateMainFollowerEmailSafe({
    targetEmail: targetUser.email,
    followerEmail: currentUser.email,
    follow: Boolean(shouldFollow),
  });

  if (result?.skipped && result?.reason === "Main MongoDB is not connected") {
    throw new Error("Follow sync is unavailable (main database not connected)");
  }

  if (result?.targetMatched === 0) {
    throw new Error(
      "Target user has no Quantum Logics account with this email — follow needs a matching quantum_logics.users document",
    );
  }

  const [viewer, target] = await Promise.all([
    toPublicUser(currentUser),
    toPublicUser(targetUser),
  ]);

  return {
    isFollowing: Boolean(shouldFollow),
    user: viewer,
    targetUser: target,
  };
}

async function isFollowingUser(viewerUserId, targetUsername) {
  const normalizedUsername = String(targetUsername || "").trim().toLowerCase();
  const [viewer, target] = await Promise.all([
    User.findById(viewerUserId),
    User.findOne({ username: normalizedUsername }),
  ]);
  if (!viewer || !target) {
    throw new Error("User not found");
  }

  const social = await getMainSocialByEmail(target.email);
  return social.followers.includes(normalizeEmail(viewer.email));
}

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} User object
 */
async function changePassword(userId, oldPassword, newPassword) {
  try {
    const user = await User.findById(userId).select("+password");

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.password) {
      throw new Error(
        "This Google account has no password. Sign in with Google, or set a password from account settings after linking.",
      );
    }

    const isPasswordValid = await user.comparePassword(oldPassword);

    if (!isPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    return user.toJSON();
  } catch (error) {
    throw error;
  }
}

/**
 * Delete user account
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Deleted user object
 */
async function deleteUserAccount(userId) {
  try {
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return { message: "Account deleted successfully" };
  } catch (error) {
    throw error;
  }
}

/**
 * Profile pictures are not stored on lean user documents.
 */
async function setProfilePicture(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  return toPublicUser(user);
}

module.exports = {
  registerUser,
  loginUser,
  loginOrRegisterWithGoogle,
  getUserById,
  getUserByUsername,
  getUserByEmail,
  listUserConnections,
  updateUserProfile,
  setFollowRelationship,
  isFollowingUser,
  setProfilePicture,
  changePassword,
  deleteUserAccount,
};
