import { Schema, type Document, model, models } from "mongoose"

export interface ISetting extends Document {
  key: string
  value: any
}

const SettingSchema = new Schema<ISetting>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
)

export const Setting = models.Setting || model<ISetting>("Setting", SettingSchema)
