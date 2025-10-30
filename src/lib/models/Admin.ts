import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IAdmin extends Document {
  email: string;
  password: string;
  comparePassword(password: string): Promise<boolean>;
}

const AdminSchema = new Schema<IAdmin>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

AdminSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

export const Admin =
  mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema);
