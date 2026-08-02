import mongoose, { Schema } from "mongoose";

const TaskSchema = new Schema(
  {
    // CA who created the task
    assignedCaId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Client (optional)
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // Staff assigned (null for open tasks)
    assignedStaffId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // Creator
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    assignmentType: {
      type: String,
      enum: ["direct", "open"],
      default: "direct",
      index: true,
    },

    status: {
      type: String,
      enum: [
        "open",
        "assigned",
        "accepted",
        "in_progress",
        "review",
        "completed",
        "cancelled",
      ],
      default: "assigned",
      index: true,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      index: true,
    },

    dueDate: Date,

    acceptedAt: Date,

    startedAt: Date,

    completedAt: Date,

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

TaskSchema.index({
  assignedCaId: 1,
  assignedStaffId: 1,
  status: 1,
});

const TaskModel = mongoose.models.Task || mongoose.model("Task", TaskSchema);
export default TaskModel;
