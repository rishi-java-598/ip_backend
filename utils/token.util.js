import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET; // move to environment variable in production
const JWT_EXPIRES_IN = "1d"; // token expiration

// Generate token
function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Verify token
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export  { generateToken, verifyToken };
