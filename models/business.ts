import { Schema, model, models, Types } from "mongoose"

const BusinessSchema = new Schema(
  {
    name: { type: String, required: true },
    description: String,
    type: String, // industry/type
    location: String,
    registrationNumber: String,
    owner: { type: Types.ObjectId, ref: "User" }, // admin who owns this business
    managers: [{ type: Types.ObjectId, ref: "User" }],
    createdBy: { type: Types.ObjectId, ref: "User", required: true }, // usually admin
    valuation: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    tags: [String],
  },
  { timestamps: true },
)

export const Business = models.Business || model("Business", BusinessSchema)
