import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    subscriptionId: {
      type: String,
      required: true,
      index: true,
    },

    invoiceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    paymentId: {
      type: String,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    status: {
      type: String,
      enum: ["paid", "issued", "pending", "failed", "cancelled"],
      default: "paid",
    },

    pdfUrl: {
      type: String,
    },

    billingStart: {
      type: Date,
    },

    billingEnd: {
      type: Date,
    },

    issuedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const InvoiceModel =
  mongoose.models.Invoice ||
  mongoose.model("Invoice", invoiceSchema);

export default InvoiceModel;