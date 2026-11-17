import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IComment extends Document {
  projectId: Types.ObjectId;
  content: string;
  author?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      default: "You",
    },
  },
  { timestamps: true }
);

const Comment: Model<IComment> =
  (mongoose.models.Comment as Model<IComment>) ||
  mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;
