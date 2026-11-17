import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IProject extends Document {
  title: string;
  description?: string;
  clientId: Types.ObjectId;
  budget: number;
  startDate?: Date;
  deadline?: Date;
  status: string;
  priority: string;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
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
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    budget: {
      type: Number,
      required: true,
      default: 0,
    },
    startDate: {
      type: Date,
    },
    deadline: {
      type: Date,
    },
    status: {
      type: String,
      default: "Planning",
    },
    priority: {
      type: String,
      default: "Medium",
    },
    progress: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Project: Model<IProject> =
  (mongoose.models.Project as Model<IProject>) ||
  mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
