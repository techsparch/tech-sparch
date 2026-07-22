import mongoose from "mongoose";

const documentCategorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
      trim: true,
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

documentCategorySchema.index({ clientId: 1, categoryName: 1 }, { unique: true });

const CategoryModel =
  mongoose.models.DocumentCategory ||
  mongoose.model("DocumentCategory", documentCategorySchema);

export default CategoryModel;
