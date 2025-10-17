import { Schema, model, models, Types } from "mongoose"

const MilestoneSchema = new Schema(
  {
    title: String,
    description: String,
    dueDate: Date,
    status: { type: String, enum: ["PLANNED", "IN_PROGRESS", "DONE"], default: "PLANNED" },
  },
  { _id: true, timestamps: true },
)

const ExpenseSchema = new Schema(
  {
    title: String,
    amount: Number,
    currency: { type: String, default: "USD" },
    occurredAt: { type: Date, default: Date.now },
  },
  { _id: true, timestamps: true },
)

const ProjectSchema = new Schema(
  {
    business: { type: Types.ObjectId, ref: "Business", required: true },
    name: { type: String, required: true },
    description: String,
    investors: [{ type: Types.ObjectId, ref: "User" }],
    milestones: [MilestoneSchema],
    expenses: [ExpenseSchema],
    status: { type: String, enum: ["PLANNED", "ACTIVE", "COMPLETED", "ON_HOLD"], default: "PLANNED" },
    returnsToDate: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export const Project = models.Project || model("Project", ProjectSchema)
