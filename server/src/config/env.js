const dotenv = require("dotenv");
const path = require("path");

// Always load the .env that lives in the server root,
// regardless of where Node is started from.
dotenv.config({
  path: path.resolve(__dirname, "..", "..", ".env"),
});

module.exports = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || "replace-me-in-env",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_ANON_KEY,
};
