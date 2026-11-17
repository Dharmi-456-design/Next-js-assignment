import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IDeliverable extends Document {
  title: string;
  description?: string;
  projectId: Types.ObjectId;
  submissionDate?: Date;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const DeliverableSchema = new Schema<IDeliverable>(
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
    submissionDate: {
      type: Date,
    },
    fileUrl: {
      type: String,
      trim: true,
    },
    fileName: {
      type: String,
      trim: true,
    },
    fileType: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Deliverable: Model<IDeliverable> =
  (mongoose.models.Deliverable as Model<IDeliverable>) ||
  mongoose.model<IDeliverable>("Deliverable", DeliverableSchema);

export default Deliverable;
