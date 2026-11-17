import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClient extends Document {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Client: Model<IClient> =
  (mongoose.models.Client as Model<IClient>) ||
  mongoose.model<IClient>("Client", ClientSchema);

export default Client;
