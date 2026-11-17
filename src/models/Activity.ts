import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IActivity extends Document {
  title: string;
  description?: string;
  projectId?: Types.ObjectId;
  clientId?: Types.ObjectId;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
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
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
    },
    type: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Activity: Model<IActivity> =
  (mongoose.models.Activity as Model<IActivity>) ||
  mongoose.model<IActivity>("Activity", ActivitySchema);

export default Activity;
