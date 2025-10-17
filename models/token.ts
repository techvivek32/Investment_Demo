import { Schema, type Document, models, model } from "mongoose"

export type TokenType = "verify" | "reset"

export interface IToken extends Document {
  user: Schema.Types.ObjectId
  type: TokenType
  tokenHash: string
  expiresAt: Date
  usedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

const TokenSchema = new Schema<IToken>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["verify", "reset"], required: true, index: true },
    tokenHash: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

TokenSchema.index({ type: 1, tokenHash: 1 })

export const Token = models.Token || model<IToken>("Token", TokenSchema)
