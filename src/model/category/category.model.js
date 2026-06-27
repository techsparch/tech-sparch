import mongoose from "mongoose";

const documentCategorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DocumentCategory",
    },

    // 👇 list of document types under this category
    docNames: {
      type: [String],
      default: [],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const CategoryModel =
  mongoose.models.DocumentCategory ||
  mongoose.model("DocumentCategory", documentCategorySchema);

export default CategoryModel;
