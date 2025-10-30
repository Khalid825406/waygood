import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";


dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });


const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error(" MONGODB_URI not found in .env.local");

  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(uri);
  console.log(" MongoDB Connected Successfully");
};


const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);


async function createAdmin() {
  try {
    await connectDB();

    const email = process.env.EMAIL;
    const plainPassword = process.env.PASSWORD;

    if (!email || !plainPassword) {
      throw new Error("EMAIL or PASSWORD not found in .env.local");
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log(` Admin already exists: ${existing.email}`);
      process.exit(0);
    }

    const hashed = await bcrypt.hash(plainPassword, 10);
    const admin = await Admin.create({ email, password: hashed });

    console.log("Admin created successfully:");
  } catch (err) {
    console.error("Error creating admin:", err);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}


createAdmin();
