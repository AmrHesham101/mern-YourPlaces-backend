const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const UserModel = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await UserModel.find({}, "-password");
  } catch (error) {
    return next(new HttpError("Fetching users failed, please try again", 500));
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data ", 422)
    );
  }
  const { name, email, password, imageUrl } = req.body;
  let existingUser;
  try {
    existingUser = await UserModel.findOne({ email: email });
  } catch (error) {
    return next(new HttpError("Signing up failed, please try again.", 500));
  }
  if (existingUser) {
    return next(new HttpError("User exist already, please login instead", 422));
  }
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(new HttpError("Could not create user, please try again", 500));
  }
  const createdUser = new UserModel({
    name,
    email,
    image: imageUrl,
    password: hashedPassword,
    places: [],
  });
  try {
    await createdUser.save();
  } catch (err) {
    return next(new HttpError("created place failed, please try again", 500));
  }
  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("Signing up failed, please try again.", 500));
  }
  res.status(201).json({
    userId: createdUser.id,
    email: createdUser.email,
    name: createdUser.name,
    token: token,
  });
};
const login = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;
  try {
    existingUser = await UserModel.findOne({ email: email });
  } catch (error) {
    return next(new HttpError("Logging in failed, please try again.", 500));
  }
  if (!existingUser) {
    return next(
      new HttpError("Invalid credentials, could not log you in", 403)
    );
  }
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    return next(
      new HttpError(
        "Could not log in, please check your credentials and try again",
        403
      )
    );
  }
  if (!isValidPassword) {
    return next(
      new HttpError("Invalid credentials, could not log you in", 403)
    );
  }
  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("Logging in failed, please try again.", 500));
  }
  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    name: existingUser.name,
    token: token,
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
