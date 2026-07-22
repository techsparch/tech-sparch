import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    assignedCaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    razorpayCustomerId: {
      type: String,
      default: null,
      index: true,
    },

    razorpaySubscriptionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    razorpayPlanId: {
      type: String,
      required: true,
    },

    planName: {
      type: String,
      required: true,
      default: "Monthly Subscription",
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    status: {
      type: String,
      enum: [
        "created",
        "authenticated",
        "active",
        "grace_period",
        "expired",
        "cancelled",
      ],
      default: "created",
      index: true,
    },

    serviceEnabled: {
      type: Boolean,
      default: false,
      index: true,
    },

    activatedAt: {
      type: Date,
      default: null,
    },

    lastPaymentAt: {
      type: Date,
      default: null,
    },

    currentPeriodStart: {
      type: Date,
      default: null,
    },

    currentPeriodEnd: {
      type: Date,
      default: null,
    },

    nextRenewalAt: {
      type: Date,
      default: null,
    },

    gracePeriodEndsAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    graceDays: {
      type: Number,
      default: 7,
      min: 0,
    },

    paymentMethod: {
      type: String,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  },
);

SubscriptionSchema.index({ userId: 1 });
SubscriptionSchema.index({ assignedCaId: 1 });
SubscriptionSchema.index({ razorpaySubscriptionId: 1 });
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ serviceEnabled: 1 });

const SubscriptionModel =
  mongoose.models.Subscription ||
  mongoose.model("Subscription", SubscriptionSchema);

export default SubscriptionModel;