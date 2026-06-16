import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],

      validate: {
        validator: function (value) {
          return /^[A-Za-z]+(?:\s[A-Za-z]+)+$/.test(value);
        },
        message: "Please enter full name with at least one space",
      },
    },

    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
      index: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
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

    accessCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
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

// optional index
UserSchema.index({ createdAt: -1 });

const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);

export default UserModel;
