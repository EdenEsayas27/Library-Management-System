const bcrypt = require("bcryptjs");
const supabase = require("../config/supabase");
const { signToken } = require("../utils/jwt");

async function login(req, res) {
  const { email, password } = req.body;
  const { data: user, error } = await supabase
    .from("staff")
    .select("id, email, password_hash, role")
    .eq("email", email)
    .single();

  if (error || !user) return res.status(401).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken({ sub: user.id, email: user.email, role: user.role });
  return res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
}

// Stateless JWT logout is usually handled on client (remove token / blacklist if needed)
function logout(_req, res) {
  return res.json({ message: "Logged out. Remove token on client side." });
}

module.exports = { login, logout };
