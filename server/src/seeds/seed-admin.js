const bcrypt = require("bcryptjs");
const supabase = require("../config/supabase");

async function seedAdmin() {
  try {
    const email = process.env.SEED_ADMIN_EMAIL || "admin@library.com";
    const password = process.env.SEED_ADMIN_PASSWORD || "Admin@12345";
    const fullName = process.env.SEED_ADMIN_NAME || "System Admin";
    const role = "admin";

    const { data: existing, error: findError } = await supabase
      .from("staff")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    if (findError) {
      throw findError;
    }

    if (existing) {
      console.log(`Admin already exists: ${existing.email}`);
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("staff")
      .insert({
        full_name: fullName,
        email,
        password_hash,
        role,
      })
      .select("id, full_name, email, role")
      .single();

    if (error) {
      throw error;
    }

    console.log("Admin created successfully:");
    console.log(data);
    console.log("Login credentials:");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log("Change this password after first login.");
  } catch (error) {
    console.error("Failed to seed admin:", error.message);
    process.exitCode = 1;
  }
}

seedAdmin();
