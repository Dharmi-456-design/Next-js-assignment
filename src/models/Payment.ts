import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPayment extends Document {
  projectId: Types.ObjectId;
  clientId: Types.ObjectId;
  amount: number;
  paymentDate: Date;
  method: string;
  status: string;
  reference?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    method: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "Pending",
    },
    reference: {
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

const Payment: Model<IPayment> =
  (mongoose.models.Payment as Model<IPayment>) ||
  mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;
