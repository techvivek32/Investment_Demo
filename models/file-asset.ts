import { Schema, models, model } from "mongoose"

const FileAssetSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    businessId: { type: Schema.Types.ObjectId, ref: "Business" },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    kind: { type: String, enum: ["KYC", "Business", "Project", "Investment", "Other"], default: "Other", index: true },
    filename: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number },
    mimeType: { type: String },
    tags: [{ type: String }],
  },
  { timestamps: true },
)

export default models.FileAsset || model("FileAsset", FileAssetSchema)
