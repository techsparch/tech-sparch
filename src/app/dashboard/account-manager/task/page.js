// app/tasks/create/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, AlignLeft, Type, Flag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PRIORITIES = ["low", "medium", "high"];

export default function CreateTaskPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);

  useEffect(() => {
    const fetchRecentTasks = async () => {
      try {
        const res = await fetch("/api/account-manager/task/check");
        if (res.ok) {
          const data = await res.json();
          const formattedTasks = data.tasks.map((t) => ({
            id: t._id,
            title: t.title,
            dueDate: t.dueDate,
            status: t.status || "Open",
            description: t.description,
          }));
          setRecentTasks(formattedTasks);
        }
      } catch (error) {
        console.error("Failed to fetch recent tasks:", error);
      }
    };

    fetchRecentTasks();
  }, []);

  console.log(recentTasks);

  const handleDelete = async (taskId) => {
    setDeletingId(taskId);
    try {
      const response = await fetch(
        `/api/account-manager/task/delete/${taskId}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        setRecentTasks((prevTasks) =>
          prevTasks.filter((task) => task.id !== taskId),
        );
      } else {
        console.error("Failed to delete task.");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        assignmentType: "open",
      };

      const res = await fetch("/api/account-manager/task/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.details || "Failed to create task.");
      }

      toast.success("Task added");

      setRecentTasks((prev) => [
        {
          id: data._id || data.task?._id || data.id,
          title: form.title,
          priority: form.priority,
          description: form.description, 
          dueDate: form.dueDate,
          status: "Open",
        },
        ...prev.slice(0, 4),
      ]);

      setForm({ title: "", description: "", priority: "medium", dueDate: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-12 font-sans text-dark">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <button
            onClick={() => router.push("/dashboard/account-manager")}
            className="flex items-center text-sm font-medium text-dark hover:text-zinc-900 transition-colors capitalize"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to DashBoard
          </button>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Create a New Task
          </h1>
          <p className="text-dark/40 capitalize">
            Deploy an open task to the firm. Available staff will be able to
            pick this up.
          </p>
        </div>

        <Separator className="bg-zinc-200" />

        {/* Task Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 md:p-8 rounded-xl border border-zinc-200 shadow-sm space-y-6"
        >
          {/* Title */}
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="flex items-center text-zinc-700 font-medium"
            >
              <Type className="w-4 h-4 mr-2 text-zinc-400" />
              Task Title <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Audit preparation for Q3"
              className="bg-zinc-50 focus-visible:ring-zinc-500 border-zinc-200 h-11"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="flex items-center text-zinc-700 font-medium"
            >
              <AlignLeft className="w-4 h-4 mr-2 text-zinc-400" />
              Detailed Description
            </Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              placeholder="Provide any context, client details, or prerequisites..."
              className="bg-zinc-50 focus-visible:ring-zinc-500 border-zinc-200 resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 text-base bg-dark text-white shadow-md hover:bg-zinc-800 transition-colors"
            >
              {submitting ? "Deploying Task..." : "Create & Deploy Task"}
            </Button>
            <p className="text-xs text-center text-zinc-400 mt-3 capitalize">
              Task will immediately be visible on the open board.
            </p>
          </div>
        </form>

        {/* Task Status Table Section */}
        <div className="mt-12 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
            Recent Task
          </h2>
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-600">
                <thead className="border-b border-zinc-200 bg-zinc-50/50 text-zinc-900">
                  <tr>
                    <th className="px-6 py-4 font-medium">Task</th>
                    <th className="px-6 py-4 font-medium">Description</th>
                    {/* <th className="px-6 py-4 font-medium">Due Date</th> */}
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {recentTasks.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-zinc-500"
                      >
                        No tasks deployed yet. Created tasks will appear here.
                      </td>
                    </tr>
                  ) : (
                    recentTasks.map((task) => (
                      <tr
                        key={task.id}
                        className="transition-colors hover:bg-zinc-50/50 group"
                      >
                        <td className="px-6 py-4 font-medium text-zinc-900 capitalize">
                          {task.title}
                        </td>
                        {/* <td className="px-6 py-4 capitalize">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              task.priority === "high"
                                ? "bg-red-50 text-red-700"
                                : task.priority === "medium"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {task.priority}
                          </span>
                        </td> */}
                        <td className="px-6 py-4 text-zinc-500 max-w-xs">
                          <p
                            className="line-clamp-2 break-words"
                            title={task?.description || ""}
                          >
                            {task?.description || "—"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                            {task.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                disabled={deletingId === task.id}
                                className="inline-flex items-center justify-center rounded-md p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Delete Task"
                              >
                                <span className="sr-only">Delete</span>
                                {deletingId === task.id ? (
                                  <svg
                                    className="h-4 w-4 animate-spin text-red-600"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                ) : (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M3 6h18"></path>
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                  </svg>
                                )}
                              </button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the task &quot;
                                  {task.title}&quot;. This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(task.id)}
                                  className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
                                >
                                  Delete Task
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
