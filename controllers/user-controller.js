const { User } = require("../models/user.js");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { Token } = require("../models/token.js");
const sendEmail = require("../utils/email");

/**
 * POST /signup
 */
exports.signup = async function(req, res, next) {
  // Check for validation errors

  // Make sure this account doesn't already exist
  let user = await User.findOne({ email: req.body.email });

  // Make sure user doesn't already exist
  if (user)
    return res.status(400).send({
      msg:
        "The email address you have entered is already associated with another account."
    });

  // Create and save the user
  user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password
  });
  await user.save();

  // Create a verification token for this user
  let token = new Token({
    _userId: user._id,
    token: crypto.randomBytes(16).toString("hex")
  });

  // Save the verification token
  await token.save();
  const options = {
    email: user.email,
    subject: "Account Verification Token",
    message: token.token
  };
  await sendEmail(options);
  res
    .status(200)
    .send("A verification email has been sent to " + user.email + ".");
};

/**
 * POST /confirmation
 */
exports.confirmToken = async function(req, res, next) {
  // Find a matching token
  const token = await Token.findOne({ token: req.body.token });
  if (!token)
    return res.status(400).send({
      msg: "We were unable to find a valid token. Your token my have expired."
    });
  console.log(token);
  // If we found a token, find a matching user
  const user = await User.findOne({
    _id: token._userId,
    email: req.body.email
  });
  if (!user)
    return res
      .status(400)
      .send({ msg: "We were unable to find a user for this token." });
  if (user.isVerified)
    return res.status(400).send({
      msg: "This user has already been verified."
    });

  // Verify and save the user
  user.isVerified = true;
  await user.save();
  res.status(200).send("The account has been verified. Please log in.");
};

/**
 * POST /resend
 */
exports.resendToken =async function(req, res, next) {

  const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res
        .status(400)
        .send({ msg: "We were unable to find a user with that email." });
    if (user.isVerified)
      return res
        .status(400)
        .send({
          msg: "This account has already been verified. Please log in."
        });

    // Create a verification token, save it, and send email
    const token = new Token({
      _userId: user._id,
      token: crypto.randomBytes(16).toString("hex")
    });

    // Save the token
    await token.save();

    const mailOptions={
        email:user.email,
        subject:"Account Verification Token",
        message:token.token
    };
    await sendEmail(mailOptions);

   
    
    res
    .status(200)
    .send("A verification email has been sent to " + user.email + ".");
 
  

};
