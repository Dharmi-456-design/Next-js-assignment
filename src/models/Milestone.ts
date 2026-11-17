import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IMilestone extends Document {
  title: string;
  description?: string;
  projectId: Types.ObjectId;
  dueDate?: Date;
  status: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema<IMilestone>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      default: "To Do",
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Milestone: Model<IMilestone> =
  (mongoose.models.Milestone as Model<IMilestone>) ||
  mongoose.model<IMilestone>("Milestone", MilestoneSchema);

export default Milestone;
