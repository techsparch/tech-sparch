import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DocumentCategory",
      required: true,
      index: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedCaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    originalFileName: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      required: true,
      unique: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    format: {
      type: String,
      required: true,
    },

    bytes: {
      type: Number,
      default: 0,
    },

    folder: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

const DocumentModel =
  mongoose.models.Document || mongoose.model("Document", documentSchema);

export default DocumentModel;
