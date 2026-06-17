import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true, // ✅ index auto-created by unique
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true, // ✅ no duplicate emails
      sparse: true, // ✅ allows null/missing
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // ✅ never leaked in queries
    },

    role: {
      type: String,
      enum: ["system", "ca", "staff", "client"],
      default: "client",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    imageUrl: {
      type: String,
    },

    accessCode: {
      type: String,
      unique: true,
      sparse: true, // ✅ allows null/missing
    },

    assignedCaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

UserSchema.index({ createdAt: -1 });

const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);

export default UserModel;
