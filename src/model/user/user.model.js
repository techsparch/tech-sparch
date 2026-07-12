import mongoose from "mongoose";

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

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

    shopName: {
      type: String,
      trim: true,
      maxlength: [100, "Shop name cannot exceed 100 characters"],
      default: "",
    },

    businessType: {
      type: String,
      enum: {
        values: [
          "Sole Proprietorship",
          "Partnership",
          "Private Limited",
          "LLP",
          "Other",
          "",
        ],
        message: "{VALUE} is not a valid business type",
      },
      default: "",
    },

    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
      validate: {
        validator: (v) => !v || GST_REGEX.test(v),
        message: "Enter a valid 15-character GST number",
      },
      default: "",
    },

    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
      validate: {
        validator: (v) => !v || PAN_REGEX.test(v),
        message: "Enter a valid 10-character PAN",
      },
      default: "",
    },

    address: {
      type: String,
      trim: true,
      maxlength: [250, "Address cannot exceed 250 characters"],
      default: "",
    },

    altMobile: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => !v || /^[0-9]{10}$/.test(v),
        message: "Enter a valid 10-digit mobile number",
      },
      default: "",
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

UserSchema.index({ createdAt: -1 });

const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);

export default UserModel;