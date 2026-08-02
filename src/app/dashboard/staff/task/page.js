"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Calendar,
  Loader2,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  MoveLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // --- Pagination State ---
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalTasks: 0,
    limit: 30,
  });

  const fetchTasks = useCallback(
    async (pageToFetch = page) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/account-manager/task/send?page=${pageToFetch}&limit=${pagination.limit}`,
        );
        if (!res.ok) throw new Error("Failed to fetch tasks");
        const data = await res.json();

        setTasks(data.tasks || []);

        if (data.pagination) {
          setPagination({
            totalPages: data.pagination.totalPages,
            totalTasks: data.pagination.totalTasks,
            limit: data.pagination.limit,
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [page, pagination.limit],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks(page);
  }, [page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // "Check new task" always jumps back to page 1 so newly created tasks are visible
  const handleCheckNewTasks = () => {
    if (page === 1) {
      fetchTasks(1);
    } else {
      setPage(1);
    }
  };

  const statusDot = {
    open: "bg-blue-500",
    assigned: "bg-purple-500",
    in_progress: "bg-amber-500",
    review: "bg-indigo-500",
    completed: "bg-emerald-500",
    cancelled: "bg-zinc-400",
  };

  const getPriorityColor = (priority) => {
    const priorityStyles = {
      low: "bg-zinc-100 text-zinc-600 border-zinc-200",
      medium: "bg-blue-50 text-blue-700 border-blue-200",
      high: "bg-orange-50 text-orange-700 border-orange-200",
      urgent: "bg-red-50 text-red-700 border-red-200",
    };
    return (
      priorityStyles[priority] || "bg-zinc-100 text-zinc-600 border-zinc-200"
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const isOverdue = (dateString, status) => {
    if (!dateString || status === "completed" || status === "cancelled")
      return false;
    return new Date(dateString) < new Date();
  };

  const markAsDone = async (taskId) => {
    const previousTasks = tasks;
    setUpdatingId(taskId);

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: "completed" } : t)),
    );

    try {
      const res = await fetch(`/api/account-manager/task/change/${taskId}`, {
        method: "PATCH",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to update task");
      }

      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, ...data.task } : t)),
      );
    } catch (err) {
      setTasks(previousTasks);
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-12 font-sans text-zinc-900">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header Section */}
        <div className="mb-8">
          <Link
            href="/dashboard/staff"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <MoveLeft />
            Back to Staff
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Tasks
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {loading
                ? "Loading..."
                : `${pagination.totalTasks} task${pagination.totalTasks === 1 ? "" : "s"} across your board`}
            </p>
          </div>

          <Button
            onClick={handleCheckNewTasks}
            disabled={loading}
            className="bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Check new task
          </Button>
        </div>

        {/* Table Section */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden">
          {error ? (
            <div className="p-10 text-center">
              <p className="text-sm font-medium text-red-600">
                Couldn&apos;t load tasks
              </p>
              <p className="text-sm text-zinc-500 mt-1">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => fetchTasks(page)}
              >
                Retry
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-zinc-200 hover:bg-transparent">
                    <TableHead className="w-[38%] text-xs font-medium uppercase tracking-wide text-zinc-500 py-3.5">
                      Task
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Priority
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wide text-zinc-500 hidden md:table-cell">
                      Due
                    </TableHead>
                    <TableHead className="text-right text-xs font-medium uppercase tracking-wide text-zinc-500">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow
                        key={i}
                        className="border-b border-zinc-100 last:border-0"
                      >
                        <TableCell className="py-4">
                          <div className="h-4 w-48 bg-zinc-100 rounded animate-pulse" />
                          <div className="h-3 w-32 bg-zinc-100 rounded animate-pulse mt-2" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-16 bg-zinc-100 rounded animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="h-5 w-14 bg-zinc-100 rounded-full animate-pulse" />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="h-4 w-20 bg-zinc-100 rounded animate-pulse" />
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    ))
                  ) : tasks.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={5} className="h-48">
                        <div className="flex flex-col items-center justify-center text-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                            <Plus className="w-5 h-5 text-zinc-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-900">
                              No tasks yet
                            </p>
                            <p className="text-sm text-zinc-500 mt-0.5">
                              Create your first task to get started.
                            </p>
                          </div>
                          <Link href="/tasks/create">
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-1"
                            >
                              New task
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    tasks.map((task) => {
                      const overdue = isOverdue(task.dueDate, task.status);
                      const isUpdating = updatingId === task._id;
                      return (
                        <TableRow
                          key={task._id}
                          className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors"
                        >
                          <TableCell className="py-4">
                            <div className="font-medium text-zinc-900 truncate pr-4">
                              {task.title}
                            </div>
                            {task.description && (
                              <div className="text-sm text-zinc-500 truncate pr-4 mt-0.5">
                                {task.description}
                              </div>
                            )}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-zinc-700 capitalize">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${statusDot[task.status] || "bg-zinc-400"}`}
                              />
                              {task.status.replace("_", " ")}
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`capitalize font-normal ${getPriorityColor(task.priority)}`}
                            >
                              {task.priority}
                            </Badge>
                          </TableCell>

                          <TableCell className="hidden md:table-cell text-sm">
                            <div
                              className={`flex items-center ${overdue ? "text-red-600 font-medium" : "text-zinc-600"}`}
                            >
                              <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                              {formatDate(task.dueDate)}
                            </div>
                          </TableCell>

                          <TableCell className="text-right">
                            {task.status !== "completed" && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isUpdating}
                                    className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                                  >
                                    {isUpdating ? (
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                    )}
                                    Done
                                  </Button>
                                </AlertDialogTrigger>

                                <AlertDialogContent className="bg-white">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you absolutely sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will mark the task{" "}
                                      <strong>&quot;{task.title}&quot;</strong>{" "}
                                      as completed. You can&apos;t easily undo
                                      this action.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="mt-0">
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => markAsDone(task._id)}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                    >
                                      Yes, mark as done
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>

              {/* === Pagination Footer === */}
              {!loading && tasks.length > 0 && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200/80 bg-zinc-50/50">
                  <p className="text-sm text-zinc-500">
                    Showing{" "}
                    <span className="font-medium text-zinc-900">
                      {(page - 1) * pagination.limit + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium text-zinc-900">
                      {Math.min(page * pagination.limit, pagination.totalTasks)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-zinc-900">
                      {pagination.totalTasks}
                    </span>{" "}
                    tasks
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => handlePageChange(page - 1)}
                      className="text-zinc-600"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === pagination.totalPages}
                      onClick={() => handlePageChange(page + 1)}
                      className="text-zinc-600"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
