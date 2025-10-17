import { Schema, model, models, Types } from "mongoose"

const TransactionSchema = new Schema(
  {
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ["CONTRIBUTION", "DISTRIBUTION", "DIVIDEND"], required: true },
    amount: { type: Number, required: true },
    note: String,
  },
  { _id: true }
)

const DocumentSchema = new Schema(
  {
    filename: String,
    path: String,
    uploadDate: { type: Date, default: Date.now },
    type: { type: String, enum: ["AGREEMENT", "RECEIPT", "PROOF", "OTHER"] },
  },
  { _id: true }
)

const InvestmentSchema = new Schema(
  {
    investor: { type: Types.ObjectId, ref: "User", required: true },
    business: { type: Types.ObjectId, ref: "Business", required: true },
    project: { type: Types.ObjectId, ref: "Project" },
    amount: { type: Number, required: true },
    currentValue: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    instrumentType: { type: String, enum: ["EQUITY", "DEBT", "CONVERTIBLE"], default: "EQUITY" },
    ownershipPercent: { type: Number, default: 0 },
    investedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["ACTIVE", "CLOSED", "PENDING"], default: "ACTIVE" },
    notes: String,
    mapLink: String,
    realizedPnL: { type: Number, default: 0 },
    unrealizedPnL: { type: Number, default: 0 },
    transactions: [TransactionSchema],
    documents: [DocumentSchema],
  },
  { timestamps: true },
)

export const Investment = models.Investment || model("Investment", InvestmentSchema)
