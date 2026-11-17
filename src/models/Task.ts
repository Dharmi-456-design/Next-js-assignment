import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ITask extends Document {
  title: string;
  description?: string;
  projectId: Types.ObjectId;
  dueDate?: Date;
  priority: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
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
    priority: {
      type: String,
      default: "Medium",
    },
    status: {
      type: String,
      default: "To Do",
    },
  },
  { timestamps: true }
);

const Task: Model<ITask> =
  (mongoose.models.Task as Model<ITask>) ||
  mongoose.model<ITask>("Task", TaskSchema);

export default Task;
