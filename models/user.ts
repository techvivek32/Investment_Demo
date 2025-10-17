import { Schema, model, models } from "mongoose"

export type UserRole = "ADMIN" | "INVESTOR"

const KYCSchema = new Schema(
  {
    pan: String,
    aadhaar: String,
    gst: String,
    passport: String,
    verified: { type: Boolean, default: false },
  },
  { _id: false },
)

const UserSchema = new Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, unique: true, required: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["ADMIN", "INVESTOR"], default: "INVESTOR", index: true },
    emailVerified: { type: Boolean, default: false },
    kyc: { type: KYCSchema, default: {} },
    createdAt: { type: Date, default: Date.now },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
  },
  { timestamps: true },
)

export const User = models.User || model("User", UserSchema)

export default User
