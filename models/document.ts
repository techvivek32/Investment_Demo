import { Schema, model, models, Types } from "mongoose"

const DocumentSchema = new Schema(
  {
    ownerUser: { type: Types.ObjectId, ref: "User" },
    business: { type: Types.ObjectId, ref: "Business" },
    project: { type: Types.ObjectId, ref: "Project" },
    kind: { type: String, enum: ["KYC", "BUSINESS", "PROJECT", "INVESTMENT"], required: true },
    url: { type: String, required: true },
    publicId: String, // for Cloudinary
    filename: String,
    mimeType: String,
    size: Number,
    tags: [String],
    uploadedBy: { type: Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
)

export const Document = models.Document || model("Document", DocumentSchema)

export default Document
